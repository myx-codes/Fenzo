import { ObjectId } from "mongoose";
import { ProductCollection, ProductStatus, ProductType } from "../enums/product.enums";

export interface Product {
    _id: ObjectId;
    productStatus: ProductStatus;
    productCollection: ProductCollection;
    productType: ProductType;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productSold: number;
    productDesc?: string;
    productImages: string[];
    productViews: number;
    productRating: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductInput {
    productStatus?: ProductStatus;
    productCollection: ProductCollection;
    productType: ProductType;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productDesc?: string;
    productImages?: string[];
}

export interface ProductUpdateInput {
    _id: ObjectId;
    productStatus?: ProductStatus;
    productCollection?: ProductCollection;
    productType?: ProductType;
    productName?: string;
    productPrice?: number;
    productLeftCount?: number;
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