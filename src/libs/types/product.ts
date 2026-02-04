import { Types } from "mongoose";
import {
  ProductStatus,
  ProductCollection,
  ProductType,
  ProductGender,
  ProductUnit
} from "../enums/product.enums";

export interface Product {
  _id: Types.ObjectId;

  // kim qo‘shgan product
  userId: Types.ObjectId;

  productStatus: ProductStatus;
  productType: ProductType;
  productCollection: ProductCollection;

  productName: string;
  productDesc: string;

  productPrice: number;
  productDiscountPrice: number;

  productStock: number;
  productUnit: ProductUnit;
  productGender: ProductGender;

  productImages: string[];

  productViews: number;
  productLikes: number;
  productRating: number;

  createdAt: Date;
  updatedAt: Date;
}


export interface ProductInput {
  userId: Types.ObjectId;

  productCollection: ProductCollection;
  productName: string;
  productDesc: string;

  productPrice: number;
  productStock: number;

  productStatus?: ProductStatus;
  productType?: ProductType;
  productDiscountPrice?: number;
  productUnit?: ProductUnit;
  productGender?: ProductGender;
  productImages?: string[];
}


export interface ProductUpdateInput {
  _id: Types.ObjectId;

  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productType?: ProductType;

  productName?: string;
  productDesc?: string;

  productPrice?: number;
  productDiscountPrice?: number;
  productStock?: number;

  productUnit?: ProductUnit;
  productGender?: ProductGender;
  productImages?: string[];
}


export interface ProductInquiry {
  order?: "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "TOP_RATED";
  page: number;
  limit: number;

  productCollection?: ProductCollection;
  search?: string;
}
