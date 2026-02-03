import {ObjectId, Types} from "mongoose"
import { ViewGroup } from "../enums/view.enums";

export interface View{
    _id: ObjectId;
    viewGroup: ViewGroup;
    userId: ObjectId;
    viewRefId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ViewInput {
    userId: Types.ObjectId;
    viewRefId: ObjectId;
    viewGroup: ViewGroup;
}
