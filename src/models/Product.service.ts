import { ProductStatus } from "../libs/enums/product.enums"
import { shapeIntoMongooseObjectId } from "../libs/config"
import { Errors, HttpCode, Message } from "../libs/Errors"
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product"
import ProductModel from "../schema/Product.model"
import { T } from "../libs/types/common"

class ProductService {
    private readonly productModel
    constructor(){
        this.productModel = ProductModel
    };
     
    // BSSR APIs
    public async addProduct(input: ProductInput): Promise<Product>{
        try{
            const result = await this.productModel.create(input)
            return result.toObject() as Product
        }catch(err){
            console.log("Error, Service.model addProduct", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    };


    public async getAllProducts(inquiry: ProductInquiry) {
        // 1. Match (Filter) yasash
        const match: any = { productStatus: { $ne: "DELETE" } }; // O'chirilganlarni ko'rsatma

        if (inquiry.productCollection) {
            match.productCollection = inquiry.productCollection;
        }

        if (inquiry.search) {
            match.productName = { $regex: new RegExp(inquiry.search, "i") };
        }

        // 2. Sort (Tartiblash) yasash
        let sort: any = { createdAt: -1 }; // Default: Yangilari tepada
        if (inquiry.order === "price_low") sort = { productPrice: 1 };
        if (inquiry.order === "price_high") sort = { productPrice: -1 };
        if (inquiry.order === "new") sort = { createdAt: -1 };

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


    public async getProduct(id: string): Promise<Product> {
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
    public async getProducts(inquiry: ProductInquiry): Promise<Product[]>{
        const match: T = {productStatus: ProductStatus.ACTIVE};
        if(inquiry.productCollection)
            match.productCollection = inquiry.productCollection;
        if(inquiry.search){
            match.productName = { $regex: new RegExp(inquiry.search, "i")}
        }

        const sort: T = inquiry.order === "productPrice"
        ? {[inquiry.order]: 1}
        : {[inquiry.order]: -1};

        const result = await this.productModel.aggregate([
            {$match: match},
            {$sort: sort},
            {$skip: (inquiry.page * 1 - 1) * inquiry.limit},
            {$limit: inquiry.limit * 1}
        ]).exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result
    }

}


export default ProductService