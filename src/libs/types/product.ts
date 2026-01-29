import { ObjectId } from "mongoose";
import { 
    ProductStatus, 
    ProductCollection, 
    ProductType, 
    ProductGender, 
    ProductUnit 
} from "../enums/product.enums";

export interface Product {
    _id: ObjectId;
    productStatus: ProductStatus;
    productType: ProductType;
    productCollection: ProductCollection;
    productName: string;
    productDesc: string;
    productPrice: number;
    productDiscountPrice: number; // Yangi qo'shildi
    productStock: number;         // productStock o'rniga
    productUnit: ProductUnit;
    productGender: ProductGender;
    productImages: string[];
    productViews: number;
    productLikes: number;
    productRating: number;        // Yangi qo'shildi
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductInput {
    productStatus?: ProductStatus;
    productType?: ProductType;
    productCollection: ProductCollection;
    productName: string;
    productDesc: string;
    productPrice: number;
    productDiscountPrice?: number;
    productStock: number;
    productUnit?: ProductUnit;
    productGender?: ProductGender;
    productImages?: string[];
}

export interface ProductUpdateInput {
    _id: ObjectId;
    productStatus?: ProductStatus;
    productCollection?: ProductCollection;
    productType?: ProductType;
    productName?: string;
    productPrice?: number;
    productStock?: number;
    productDesc?: string;
    productImages?: string[];
}

export interface ProductInquiry {
    order: string;
    page: number;
    limit: number;
    productCollection?: ProductCollection;
    search?: string;
}