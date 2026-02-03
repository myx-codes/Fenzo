import { Order, OrderItemInput } from "../libs/types/order";
import UserService from "./User.service";
import { User } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { Errors, HttpCode, Message } from "../libs/Errors";
import mongoose, { ObjectId, Types } from "mongoose";
import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { OrderStatus } from "../libs/enums/order.enums";


class OrderService{
    private readonly orderModel;
    private readonly orderItemModel
    private readonly userService;

    constructor(){
        this.orderModel = OrderModel
        this.orderItemModel = OrderItemModel
        this.userService = new UserService
    }

    public async createOrder(
    user: User,
    input: OrderItemInput[]
): Promise<Order> {  // Faqat asosiy Order tipini qaytarish
    const userId = shapeIntoMongooseObjectId(user._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
        return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;

    try {
        const newOrder = await this.orderModel.create({
            orderTotal: amount + delivery,
            orderDelivery: delivery,
            orderStatus: OrderStatus.PENDING,  // Default status qo'shing
            userId: userId
        });
        
        const orderId = newOrder._id;
        console.log("orderId", orderId);
        await this.recordOrderItem(orderId, input);

        return newOrder.toObject();  // Mongoose Document'dan oddiy object'ga o'tkazish
    } catch(err) {
        console.log("Error createOrder", err);
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
}

    
    public async recordOrderItem(
        orderId: Types.ObjectId,  // mongoose.Types.ObjectId
        input: OrderItemInput[]
    ): Promise<void> {
        const session = await mongoose.startSession();
        
        try {
            session.startTransaction();
            
            const promisedList = input.map(async (item: OrderItemInput) => {
                const orderItemData = {
                    ...item,
                    orderId: orderId,
                    productId: shapeIntoMongooseObjectId(item.productId)
                };
                
                await this.orderItemModel.create([orderItemData], { session });
                return "INSERTED";
            });
            
            const orderItemState = await Promise.all(promisedList);
            console.log("orderItemState", orderItemState);
            
            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }
}



export default OrderService