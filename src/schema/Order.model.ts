import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enums";

const OrderSchema = new Schema ({
    orderTotal: {
        type: Number,
        required: true
    },

    orderDelivery: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING
    },

    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },

    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => Math.floor(100000 + Math.random() * 900000).toString()
    },
},
{ timestamps: true } // updatedAt, createdAt
);

export default mongoose.model("Order", OrderSchema)