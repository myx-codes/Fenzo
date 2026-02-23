import { Types } from "mongoose";
import { UserType, UserStatus } from "../enums/user.enums";
import { Request } from "express";
import { Session } from "express-session";
import { Message } from "../Errors";

export interface User {
    _id: Types.ObjectId;
    userType: UserType;
    userStatus: UserStatus;
    userNick: string;
    userPhone: string;
    userPassword: string;
    userImage?: string;
    userPoints: number;
    userAddress?: string;
    userDesc?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface UserInput {
    userNick: string;
    userPhone: string;
    userPassword: string;
    userType?: UserType;
    userImage?: string;
    userAddress?: string;
}

export interface LoginInput {
    userNick: string;
    userPassword: string;
}

export interface UserUpdateInput {
    _id: Types.ObjectId;
    userNick?: string;
    userPhone?: string;
    userPassword?: string;
    userImage?: string;
    userAddress?: string;
    userDesc?: string;
}

/** Fields a user can update on their own profile (no _id, no userType/userStatus) */
export interface UserProfileUpdateInput {
    userNick?: string;
    userPhone?: string;
    userPassword?: string;
    userImage?: string;
    userAddress?: string;
    userDesc?: string;
}

export interface ExtendedRequest extends Request {
    flash(arg0: string, message: Message): unknown;
    user: User;
    file: Express.Multer.File;
    files: Express.Multer.File[];
}

export interface SellerRequest extends Request {
    user?: User;
    session: Session & { user?: User };
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
}

export interface CustomersResponse {
    list: User[];
    total: number;
}

export interface CustomerInQuery {
    page: number;
    limit: number;
    order?: string;          // Tartiblash (Masalan: yangilar tepada)
    search?: string;         // Qidiruv (Ism yoki Telefon raqam bo'yicha)
    userStatus?: UserStatus; // Filter: ACTIVE, BLOCK, DELETE
}

// export interface SellerRequest extends Request{
//     user: User;
//     session: Session & {user: User};

// }