import { ObjectId } from "mongoose";
import { UserType, UserStatus } from "../enums/user.enums";
import { Request } from "express";
import { Session } from "express-session";

export interface Member {
    _id: ObjectId;
    memberType: UserType;
    memberStatus: UserStatus;
    memberNick: string;
    memberPhone: string;
    memberPassword: string;
    memberImage?: string;
    memberAddress?: string;
    memberDesc?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface MemberInput {
    memberNick: string;
    memberPhone: string;
    memberPassword: string;
    memberType?: UserType;
    memberImage?: string;
    memberAddress?: string;
}

export interface LoginInput {
    memberNick: string;
    memberPassword: string;
}

export interface MemberUpdateInput {
    _id: ObjectId
    memberNick?: string;
    memberPhone?: string;
    memberPassword?: string;
    memberImage?: string;
    memberAddress?: string;
    memberDesc?: string;
}

export interface ExtendedRequest extends Request{
    member: Member;
    file: Express.Multer.File;
    files: Express.Multer.File[];
}



export interface AdminRequest extends Request{
    member: Member;
    session: Session & {member: Member};
    file: Express.Multer.File;
    files: Express.Multer.File[];
}
