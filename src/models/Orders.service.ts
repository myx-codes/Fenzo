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

    
public async recordOrderItem(orderId: Types.ObjectId,input: any[] ): Promise<void> {
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
        const orderStatus = input.orderStatus;

        let matchFilter: any;
        if (user.userType === 'SELLER') {
            const sellerProducts = await this.productModel.find({ userId }).distinct('_id');
            const orderItemsWithMyProducts = await this.orderItemModel.findOne({
                orderId,
                productId: { $in: sellerProducts }
            });
            if (!orderItemsWithMyProducts) {
                throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
            }
            matchFilter = { _id: orderId };
        } else {
            matchFilter = { userId, _id: orderId };
        }

        const result = await this.orderModel.findOneAndUpdate(
            matchFilter,
            { orderStatus },
            { new: true }
        ).exec();

        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        if(orderStatus === OrderStatus.PROCESSING){
            await this.sellerService.addCustomerPoint({ _id: result.userId } as User, 1);
        }
        return result.toObject()
};


public async getOrders(user: User, inquiry: OrderInquery): Promise<any[]> {
    console.log("getOrders ");
    
    const userId = shapeIntoMongooseObjectId(user._id);
    const page = Math.max(1, inquiry.page || 1);
    const limit = Math.max(1, Math.min(inquiry.limit || 10, 100));


    try {
        const allProductsCount = await this.productModel.countDocuments({});
        console.log("Total products in DB:", allProductsCount);
        
        const sampleProducts = await this.productModel.find({}).limit(3);
        console.log("Sample products:", sampleProducts.map(p => ({
            _id: p._id,
            productName: p.productName,
            userId: userId,
            userIdType: typeof userId,
            userIdString: userId?.toString()
        })));
    } catch (err) {
        console.log("ERROR getting products:", err);
    }
    
    const sellerProducts = await this.productModel.find({ 
        userId: userId 
    });

    sellerProducts.forEach((p, i) => {
        console.log(`Product ${i + 1}:`, {
            _id: p._id,
            productName: p.productName,
            userId: userId,
            userIdEquals: userId?.toString() === userId.toString()
        });
    });

    const matches: any = {};

    if (user.userType === 'CUSTOMER') {
        matches.userId = userId;
    } else if (user.userType === 'SELLER') {
        if (sellerProducts.length > 0) {
            const myProductIds = sellerProducts.map((ele) => ele._id);
     
            const myOrderItems = await this.orderItemModel.find({
                productId: { $in: myProductIds }
            });
            myOrderItems.forEach((item, i) => {
                console.log(`OrderItem ${i + 1}:`, {
                    _id: item._id,
                    orderId: item.orderId,
                    productId: item.productId
                });
            });
            
            const myOrderIds = [...new Set(myOrderItems.map((ele) => ele.orderId))];
            
            if (myOrderIds.length > 0) {
                matches._id = { $in: myOrderIds };
            } else {
                console.log("WARNING: No orders found for these products");
            }
        } else {
            console.log("ERROR: Seller has no products in DB");
        }
    }

    if (inquiry.orderStatus && inquiry.orderStatus !== 'ALL') {
        matches.orderStatus = inquiry.orderStatus;
    }

    const allOrdersCount = await this.orderModel.countDocuments({});
    console.log("Total orders in DB:", allOrdersCount);
    
    const sampleOrders = await this.orderModel.find({}).limit(3);

    // 4. AGGREGATION
    try {
        const result = await this.orderModel.aggregate([
  { $match: matches },
  { $sort: { updatedAt: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },

  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "buyerData"
    }
  },
  { $unwind: { path: "$buyerData", preserveNullAndEmptyArrays: true } },

  {
    $lookup: {
      from: "orderItems",
      let: { orderId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$orderId", "$$orderId"] }
          }
        },
        {
          $lookup: {
            from: "products",
            let: { pid: "$productId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$pid"] }
                }
              },
              {
                $project: {
                  productName: 1,
                  productImages: 1,
                  productPrice: 1
                }
              }
            ],
            as: "product"
          }
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } }
      ],
      as: "orderItems"
    }
  }
]).exec();


        
        if (result.length > 0) {
            result.forEach((order, i) => {
                console.log(`Order ${i + 1}:`, {
                    _id: order._id,
                    buyerData: order.buyerData ? {
                        hasData: true,
                        userNick: order.buyerData.userNick,
                        sellerNick: order.buyerData.sellerNick
                    } : { hasData: false },
                    orderTotal: order.orderTotal,
                    orderStatus: order.orderStatus
                });
            });
        }
        
        return result;
    } catch (err) {
        console.log("SERVICE: Aggregation error:", err);
        return [];
    }
}


public async getTotalOrdersCount(user: User, inquiry: OrderInquery): Promise<number> {
    const userId = shapeIntoMongooseObjectId(user._id);
    const matches: any = {};
    
    if (user.userType === 'CUSTOMER') {
        matches.userId = userId;
    } else if (user.userType === 'SELLER') {
        const sellerProducts = await this.productModel.find({ userId }).distinct('_id');
        if (sellerProducts.length > 0) {
            const myOrderIds = await this.orderItemModel.distinct('orderId', {
                productId: { $in: sellerProducts }
            });
            if (myOrderIds.length > 0) {
                matches._id = { $in: myOrderIds };
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    
    if (inquiry.orderStatus && inquiry.orderStatus !== 'ALL') {
        matches.orderStatus = inquiry.orderStatus;
    }
    
    return await this.orderModel.countDocuments(matches);
}


};
export default OrderService