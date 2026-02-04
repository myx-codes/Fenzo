import { Order, OrderInquery, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import { User } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { Errors, HttpCode, Message } from "../libs/Errors";
import mongoose, { ObjectId, Types } from "mongoose";
import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { OrderStatus } from "../libs/enums/order.enums";
import SellerService from "./Seller.service";
import ProductModel from "../schema/Product.model";


class OrderService{
    private readonly orderModel;
    private readonly orderItemModel;
    private readonly sellerService;
    private readonly productModel;

    constructor(){
        this.orderModel = OrderModel
        this.orderItemModel = OrderItemModel
        this.sellerService = new SellerService
        this.productModel = ProductModel
    }

    public async createOrder(user: User,input: OrderItemInput[]): Promise<Order> {
    const userId = shapeIntoMongooseObjectId(user._id);
    
    // 1. Product'larni bir vaqtda olish (tezlik uchun)
    const productIds = input.map(item => shapeIntoMongooseObjectId(item.productId));
    const products = await this.productModel.find({ _id: { $in: productIds } });
    
    if (products.length !== input.length) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_PRODUCT_FOUND);
    }
    
    // 2. Product map yaratish
    const productMap = new Map();
    products.forEach(p => productMap.set(p._id.toString(), p));
    
    // 3. Hisob-kitoblar
    const orderItems = [];
    let calculatedTotal = 0;
    
    for (const item of input) {
        const product = productMap.get(item.productId.toString());
        if (!product) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_PRODUCT_FOUND);
        }
        
        // Product mavjudligini tekshirish (agar kerak bo'lsa)
        if (product.productStatus !== 'ACTIVE') {
            throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
        }
        
        const itemTotal = product.productPrice * item.itemQuantity;
        calculatedTotal += itemTotal;
        
        orderItems.push({
            productId: product._id,
            itemQuantity: item.itemQuantity,
            itemPrice: product.productPrice,
            itemName: product.productName, // Qo'shimcha ma'lumot
        });
    }
    
    const DELIVERY_THRESHOLD = 100;
    const DELIVERY_FEE = 5;
    const delivery = calculatedTotal < DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    
    try {
        // 4. Order yaratish
        const newOrder = await this.orderModel.create({
            orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderTotal: calculatedTotal + delivery,
            orderDelivery: delivery,
            orderStatus: OrderStatus.PENDING,
            userId: userId,
        });
        
        console.log("orderId created:", newOrder._id);
        
        // 5. OrderItem'larni saqlash
        await this.recordOrderItem(newOrder._id, orderItems);
        
        // 6. Productlarni yangilash (sotuvlar soni)
        await this.updateProductSales(newOrder._id);
        
        return newOrder.toObject();
    } catch(err) {
        console.log("Error createOrder", err);
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
}

    private async updateProductSales(orderId: Types.ObjectId): Promise<void> {
    // 1. OrderItem'lardan quantity'larni olamiz
    const orderItems = await this.orderItemModel.find({ orderId: orderId });
    
    // 2. Har bir product uchun quantity ni update qilamiz
    for (const item of orderItems) {
        await this.productModel.findByIdAndUpdate(
            item.productId,
            { 
                $inc: { 
                    productSold: item.itemQuantity,  // quantity ga qarab
                    productQuantity: -item.itemQuantity  // ombordan kamaytiramiz
                } 
            }
        );
    }
}

    
    public async recordOrderItem(
    orderId: Types.ObjectId,
    input: any[] 
): Promise<void> {
    try {
        // Validation
        if (!input || input.length === 0) {
            throw new Error('No items to record');
        }
        
        const list = input.map((item) => ({
            orderId: orderId,
            productId: item.productId,
            itemQuantity: item.itemQuantity,
            itemPrice: item.itemPrice,
            itemTotal: item.itemPrice * item.itemQuantity, // Qo'shimcha
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        
        await this.orderItemModel.insertMany(list);
        
        console.log(`Successfully recorded ${list.length} order items`);
        
    } catch (err) {
        console.log("Error recordOrderItem:", err);
        throw err;
    }
}
    

    public async getMyOrders(user: User, inquery: OrderInquery): Promise<Order[]>{
        const userId = shapeIntoMongooseObjectId(user._id);
        const matches = {userId: userId, orderStatus: inquery.orderStatus};

        const result = await this.orderModel.aggregate([
            {$match: matches},
            {$sort: {updatedAt: -1}},
            {$skip: (inquery.page - 1) * inquery.limit},
            {$limit: inquery.limit},
            {
                $lookup: {
                    from: "orderItems",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "orderItems"
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            }
        ])
        .exec();

        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result
    };


    public async updateOrder(user: User, input: OrderUpdateInput): Promise<Order>{
        const userId = shapeIntoMongooseObjectId(user._id);
        const orderId = shapeIntoMongooseObjectId(input.orderId);
        let orderStatus = input.orderStatus;

        const result = await this.orderModel.findOneAndUpdate(
            {userId: userId,_id: orderId},
            {orderStatus: orderStatus},
            {new: true}
        ).exec();

        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        if(orderStatus = OrderStatus.PROCESSING){
            await this.sellerService.addCustomerPoint(user, 1);
        }
        return result.toObject()
    };


    public async getOrders(user: User, inquiry: OrderInquery): Promise<Order[]> {
    const userId = shapeIntoMongooseObjectId(user._id);
    
    const matches: any = {};
    
    // User turiga qarab filter
    if (user.userType === 'CUSTOMER') {
        // Customer: faqat o'z order'larini ko'radi
        matches.userId = userId;
    } else if (user.userType === 'SELLER') {
        // Seller: o'z product'larini sotilgan order'larini ko'radi
        // Buning uchun orderItems orqali filter qilish kerak
        // Bu yerdan keyin alohida aggregation qilish kerak
    }
    
    // Status filter
    if (inquiry.orderStatus && inquiry.orderStatus !== 'ALL') {
        matches.orderStatus = inquiry.orderStatus;
    }
    
    const result = await this.orderModel.aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
            }
        },
        { $unwind: "$userData" }
    ]).exec();
    
    return result;
}
}



export default OrderService