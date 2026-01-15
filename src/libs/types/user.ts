import { Types } from "mongoose";
import { UserType, UserStatus } from "../enums/user.enums";
import { Request } from "express";
import { Session } from "express-session";

export interface User {
    _id: Types.ObjectId;
    userType: UserType;
    userStatus: UserStatus;
    userNick: string;
    userPhone: string;
    userPassword: string;
    userImage?: string;
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

export interface ExtendedRequest extends Request {
    user?: User;
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
}

export interface AdminRequest extends Request {
    user?: User;
    session: Session & { user?: User };
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
}
