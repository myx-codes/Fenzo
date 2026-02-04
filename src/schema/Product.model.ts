import mongoose, { Schema, Types } from "mongoose";
import {
  ProductStatus,
  ProductCollection,
  ProductType,
  ProductGender,
  ProductUnit
} from "../libs/enums/product.enums";

const productSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE
    },

    productType: {
      type: String,
      enum: ProductType,
      default: ProductType.PHYSICAL
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    productDesc: {
      type: String,
      required: true
    },

    productPrice: {
      type: Number,
      required: true
    },

    productDiscountPrice: {
      type: Number,
      default: 0
    },

    productStock: {
      type: Number,
      required: true,
      default: 0
    },

    productUnit: {
      type: String,
      enum: ProductUnit,
      default: ProductUnit.PIECE
    },

    productGender: {
      type: String,
      enum: ProductGender,
      default: ProductGender.UNISEX
    },

    productImages: {
      type: [String],
      default: []
    },

    productViews: {
      type: Number,
      default: 0
    },

    productLikes: {
      type: Number,
      default: 0
    },

    productRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
);

// INDEXLAR
productSchema.index({ productName: "text", productDesc: "text" });
productSchema.index({ productPrice: 1 });
productSchema.index({ productRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ userId: 1 }); // 🔥 SELLER QUERY uchun

export default mongoose.model("Product", productSchema);
