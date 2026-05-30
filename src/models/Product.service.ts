import { ProductSort, ProductStatus } from "../libs/enums/product.enums"
import { shapeIntoMongooseObjectId } from "../libs/config"
import { Errors, HttpCode, Message } from "../libs/Errors"
import { Product, ProductAISearchFilters, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product"
import ProductModel from "../schema/Product.model"
import { T } from "../libs/types/common"
import { ObjectId, Types } from "mongoose"
import { ViewInput } from "../libs/types/view"
import { ViewGroup } from "../libs/enums/view.enums"
import ViewModel from "../schema/View.model"
import ViewService from "./View.service"
import ProductAISearchService from "./ProductAISearch.service"

class ProductService {
    private readonly productModel;
    public viewService;
    private readonly aiSearchService;

    constructor(){
        this.productModel = ProductModel;
        this.viewService = new ViewService()
        this.aiSearchService = new ProductAISearchService()
    };
     
    // BSSR APIs
public async addProduct(input: ProductInput): Promise<Product> {
  try {
    const result = await this.productModel.create(input);

    const product = result.toObject();

    console.log("PRODUCT CREATED (DB RESULT):", {
      _id: product._id,
      userId: product.userId,
      productName: product.productName
    });

    return product as Product;

  } catch (err) {
    console.log("Error, Service.model addProduct", err);
    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  }
}




    public async getAllProducts(inquiry: ProductInquiry) {
        // 1. Match (Filter) yasash
        const match: any = { productStatus: { $ne: "DELETE" } }; // O'chirilganlarni ko'rsatma

        if (inquiry.userId) {
            match.userId = inquiry.userId;
        }

        if (inquiry.productCollection) {
            match.productCollection = inquiry.productCollection;
        }

        if (inquiry.search) {
            match.productName = { $regex: new RegExp(inquiry.search, "i") };
        }

        // 2. Sort (Tartiblash) yasash
        let sort: Record<string, 1 | -1>;
            switch (inquiry.order) {
            case "PRICE_ASC":
                sort = { productPrice: 1 };
                break;

            case "PRICE_DESC":
                sort = { productPrice: -1 };
                break;

            case "TOP_RATED":
                sort = { productRating: -1 };
                break;

            case "NEWEST":
            default:
                sort = { createdAt: -1 };
            }


        // 3. Aggregation
        const result = await this.productModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    // a) Ro'yxat (Pagination bilan)
                    list: [
                        { $skip: (inquiry.page - 1) * inquiry.limit }, // Nechtasini o'tkazib yuborish
                        { $limit: inquiry.limit }, // Nechtasini olish
                    ],
                    // b) Umumiy soni (Pagination uchun)
                    metaData: [{ $count: "total" }],
                },
            },
        ]);

        // 4. Natijani ajratib olish
        // $facet natijasi array ichida array bo'lib qaytadi
        const products = result[0].list;
        const total = result[0].metaData.length > 0 ? result[0].metaData[0].total : 0;

        return { products, total };
    };


    public async getSellerProductsCount(userId: Types.ObjectId): Promise<number> {
        return await this.productModel.countDocuments({
            userId,
            productStatus: { $ne: "DELETE" }
        });
    }

    public async getSellerProducts(sellerId: Types.ObjectId, limit: number = 20): Promise<Product[]> {
        const result = await this.productModel
            .find({ userId: sellerId, productStatus: { $ne: "DELETE" } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return result as Product[];
    }

    public async getProductDetail(id: string): Promise<Product> {
        const result = await this.productModel.findById(id).lean();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result as unknown as Product;
    };


    public async getProductById(id: string): Promise<Product> {
        const product = await this.productModel.findById(id);
        if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_FOUND);
        return product.toObject() as Product;
    };


    public async updateChosenProduct(id: string, input: any): Promise<Product> {
        // id orqali topib, input ma'lumotlarini yangilaydi
        // { new: true } -> yangilangan ma'lumotni qaytaradi
        const result = await this.productModel.findByIdAndUpdate(id, input, { new: true });
        
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);
        return result.toObject() as Product;
    };

    public async updateProductStatus(id: string, status: string): Promise<any> {
        // Status enum ekanligini tekshirish (ixtiyoriy)
        // const search: ProductInput = { productStatus: status }; 
        
        return await ProductModel.findByIdAndUpdate(id, { productStatus: status }, { new: true });
    };
    


    // SSR APIs
    public async aiSearchProducts(rawQuery: string, options?: { page?: number; limit?: number }): Promise<Product[]> {
        const filters = this.aiSearchService.parseFilters(rawQuery);
        const match: T = { productStatus: ProductStatus.ACTIVE };

        if (filters.category) {
            match.productCollection = filters.category;
        }

        if (filters.minPrice != null || filters.maxPrice != null) {
            match.productPrice = {};
            if (filters.minPrice != null) match.productPrice.$gte = filters.minPrice;
            if (filters.maxPrice != null) match.productPrice.$lte = filters.maxPrice;
        }

        const terms = this.buildSearchTerms(filters);
        if (terms.length > 0) {
            const pattern = new RegExp(terms.map((term) => this.escapeRegex(term)).join("|"), "i");
            match.$or = [
                { productName: { $regex: pattern } },
                { productDesc: { $regex: pattern } },
            ];
        }

        const sort = this.buildAiSearchSort(filters.sort);
        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

        const result = await this.productModel
            .find(match)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();

        return result as Product[];
    }

 public async getProducts(inquery:ProductInquiry): Promise<Product[]> {
    const match: T = {productStatus: ProductStatus.ACTIVE};
    if(inquery.productCollection)
        match.productCollection = inquery.productCollection;
    if(inquery.search) {
        // match.productName = inquery.search
        match.productName = { $regex: new RegExp(inquery.search, "i")}
    }

    const orderField = inquery.order ?? "createdAt";

    const sort: T = orderField === "productPrice" 
    ? {[orderField]: 1} 
    : {[orderField]: -1};

    const result = await this.productModel.aggregate([
        {$match: match},
        {$sort: sort},
        {$skip: (inquery.page * 1 - 1) * inquery.limit},
        {$limit: inquery.limit * 1},
    ]).exec();
    if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
};


    public async getProduct(userId: Types.ObjectId | null, id: string): Promise<Product>{
        const productId = shapeIntoMongooseObjectId(id);
        console.log("[getProduct] productId", productId, "userId", userId);

        let result =  await this.productModel.findOne({_id: productId, productStatus: ProductStatus.ACTIVE}).lean<Product>().exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_PRODUCT_FOUND);

        if(userId){
            const input: ViewInput = {
                userId: userId,
                viewRefId: productId,
                viewGroup: ViewGroup.PRODUCT,
            };
            console.log("[getProduct] checking view existence", { userId, productId, viewGroup: ViewGroup.PRODUCT });

            const existView = await this.viewService.checkViewExistance(input);
            console.log("[getProduct] existView", !!existView, existView ? "viewId:" + existView._id : "none");

            if(!existView){
                console.log("[getProduct] new view – inserting and incrementing productViews");
                await this.viewService.insertUserView(input);
                console.log("[getProduct] view inserted, incrementing productViews for", productId);

                const updated = await this.productModel.findByIdAndUpdate(
                    productId,
                    { $inc: { productViews: 1 } },
                    { new: true }
                )
                    .lean<Product>()
                    .exec();
                if (updated) {
                    console.log("[getProduct] productViews incremented, new count:", updated.productViews);
                    result = updated;
                } else {
                    console.error("[getProduct] findByIdAndUpdate returned null for productId", productId);
                }
            } else {
                console.log("[getProduct] view already exists, skipping increment");
            }
        }
        return result;
    };

    private buildAiSearchSort(sort?: ProductSort): T {
        switch (sort) {
            case ProductSort.PRICE_LOW:
                return { productPrice: 1 };
            case ProductSort.PRICE_HIGH:
                return { productPrice: -1 };
            case ProductSort.TOP_RATED:
                return { productRating: -1 };
            case ProductSort.NEWEST:
            default:
                return { createdAt: -1 };
        }
    }

    private buildSearchTerms(filters: ProductAISearchFilters): string[] {
        const terms = new Set<string>();

        if (filters.keyword) {
            const keywordParts = filters.keyword.split(/\s+/).filter(Boolean);
            if (keywordParts.length > 0) keywordParts.forEach((part) => terms.add(part));
            else terms.add(filters.keyword);
        }

        if (filters.color) terms.add(filters.color);

        return Array.from(terms);
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

  
};


export default ProductService