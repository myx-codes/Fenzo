import { shapeIntoMongooseObjectId } from "../libs/config"
import { Errors, HttpCode, Message } from "../libs/Errors"
import { Product, ProductInput, ProductUpdateInput } from "../libs/types/product"
import ProductModel from "../schema/Product.model"

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

    public async getAllProducts(): Promise<Product[]>{
        const result = await this.productModel.find().lean<Product[]>().exec();
        if(result.length === 0) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result
    
    };

    public async updateChosenProduct(id: string,input: ProductUpdateInput): Promise<Product>{
        id = shapeIntoMongooseObjectId(id);
        const result = await this.productModel.findByIdAndUpdate({_id:id}, input, {new: true}).lean<Product>().exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        return result
    }


}


export default ProductService