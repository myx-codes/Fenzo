import mongoose, { Schema } from 'mongoose';
import { 
    ProductStatus, 
    ProductCollection, 
    ProductType, 
    ProductGender, 
    ProductUnit 
} from '../libs/enums/product.enums';

const productSchema = new Schema(
    {
        productStatus: {
            type: String,
            enum: ProductStatus,
            default: ProductStatus.ACTIVE,
        },

        productType: {
            type: String,
            enum: ProductType,
            default: ProductType.PHYSICAL,
        },

        productCollection: {
            type: String,
            enum: ProductCollection,
            required: true,
        },

        productName: {
            type: String,
            required: true,
        },

        productDesc: {
            type: String,
            required: true,
        },

        productPrice: {
            type: Number,
            required: true,
        },

        // Chegirma narxi (Marketplacelarda ko'p ishlatiladi)
        productDiscountPrice: {
            type: Number,
            default: 0, 
        },

        // Ombordagi qoldiq (Inventory)
        productStock: {
            type: Number,
            required: true,
            default: 0,
        },

        productUnit: {
            type: String,
            enum: ProductUnit,
            default: ProductUnit.PIECE,
        },

        // Kim uchun mo'ljallangan (Erkak, Ayol, Bola)
        productGender: {
            type: String,
            enum: ProductGender,
            default: ProductGender.UNISEX,
        },

        productImages: {
            type: [String], // Array of URLs
            default: [],
        },

        // Statistika va Sorting uchun
        productViews: {
            type: Number,
            default: 0,
        },

        productLikes: {
            type: Number,
            default: 0,
        },

        // 'TOP_RATED' sorting ishlashi uchun reyting maydoni
        productRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
    },
    { timestamps: true }
);

// --- INDEXLAR (Qidiruv va Sortlashni tezlashtirish uchun) ---

// 1. Text search (Nom va Description bo'yicha qidiruv)
productSchema.index({ productName: 'text', productDesc: 'text' });

// 2. Sorting uchun indexlar (Narx va Reyting bo'yicha)
productSchema.index({ productPrice: 1 });
productSchema.index({ productRating: -1 });
productSchema.index({ createdAt: -1 }); // NEWEST uchun

export default mongoose.model('Product', productSchema);