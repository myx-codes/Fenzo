import mongoose, { Schema } from 'mongoose';
import { UserType, UserStatus } from '../libs/enums/user.enums';

const userSchema = new Schema(
    {
        userType: {
            type: String,
            enum: UserType,
            default: UserType.CUSTOMER,
        },
        userStatus: {
            type: String,
            enum: UserStatus,
            default: UserStatus.ACTIVE,
        },
        userNick: {
            type: String,
            required: true,
            index: { unique: true, sparse: true },
        },
        userPhone: {
            type: String,
            required: true,
            index: { unique: true, sparse: true },
        },
        userPassword: {
            type: String,
            required: true,
            select: false,
        },
        userImage: {
            type: String,
        },
        userPoints: {
            type: Number,
            default: 0
        },
        userAddress: {
            type: String,
        },
        userDesc: {
            type: String,
        },
        deletedAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);