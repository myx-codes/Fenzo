import { Request, Response } from "express";
import { T } from '../libs/types/common';
import ProductService from "../models/Product.service";
import { Errors, HttpCode, Message } from "../libs/Errors";
import { SellerRequest } from "../libs/types/user";
import { ProductInput } from "../libs/types/product";

const productController: T = {};
const productService = new ProductService()

productController.getAllProducts = async(req: Request, res: Response) => {
    try{
        console.log("getAllProducts");
        res.render("products")
    }catch(err){
        console.log("Error, getAllproducts", err)
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard)
    }
};

productController.addProduct = async (req: SellerRequest, res: Response) => {
    try{
        console.log("addProduct");
        console.log("createNewProduct");
        console.log("Req.user:", req.user);
        if(!req.files?.length)
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

        const data: ProductInput = req.body;
        data.productImages = req.files.map((ele) => {
            return ele.path.replace(/\\/g, "/")
        });

        await productService.addProduct(data);

        res.send(`<script>alert("Successfully added product"); window.location.replace('seller/product/add')</script>`);

    }catch(err){
        console.log("Error addProduct", err);
        const message = err instanceof Errors? err.message: Message.SOMETHING_WENT_WRONG;
        res.send(`<script>alert(${message}); window.location.replace('seller/product/add')</script>`)
    }
}

export default productController