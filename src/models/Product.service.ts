import { ProductStatus } from "../libs/enums/product.enums"
import { shapeIntoMongooseObjectId } from "../libs/config"
import { Errors, HttpCode, Message } from "../libs/Errors"
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product"
import ProductModel from "../schema/Product.model"
import { T } from "../libs/types/common"
import { ObjectId, Types } from "mongoose"
import { ViewInput } from "../libs/types/view"
import { ViewGroup } from "../libs/enums/view.enums"
import ViewModel from "../schema/View.model"
import ViewService from "./View.service"

class ProductService {
    private readonly productModel;
    public viewService;

    constructor(){
        this.productModel = ProductModel;
        this.viewService = new ViewService()
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
    public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
  const match: any = { productStatus: ProductStatus.ACTIVE };

  if (inquiry.productCollection) {
    match.productCollection = inquiry.productCollection;
  }

  if (inquiry.search) {
    match.productName = { $regex: new RegExp(inquiry.search, "i") };
  }

  // ✅ SORT LOGIC (ENUM asosida)
  let sort: any;

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

  const page = Number(inquiry.page) || 1;
  const limit = Number(inquiry.limit) || 10;
  const skip = (page - 1) * limit;

  const result = await this.productModel.aggregate([
    { $match: match },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit }
  ]).exec();

  if (!result.length) {
    throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  }

  return result as Product[];
}


    public async getProduct(userId: Types.ObjectId | null, id: string): Promise<Product>{
        const productId = shapeIntoMongooseObjectId(id);
        console.log("userId", userId);

        let result =  await this.productModel.findOne({_id: productId, productStatus: ProductStatus.ACTIVE}).lean<Product>().exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_PRODUCT_FOUND);

        if(userId){
            const input: ViewInput = {
                userId: userId,
                viewRefId: productId,
                viewGroup: ViewGroup.PRODUCT,
            }
            console.log("userId", userId);

            const existView = await this.viewService.checkViewExistance(input);

            console.log("exist", !! existView);
            if(!existView){
                await this.viewService.insertUserView(input);


            const result2 = await this.productModel.findByIdAndUpdate(
                productId,
                {$inc:{productViews: 1}},
                {new: true}
            )
            }
        }
        return result;
    };

  
};


export default ProductService