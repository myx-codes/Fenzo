import { Request, Response } from "express";
import { T } from '../libs/types/common';
import ProductService from "../models/Product.service";
import { Errors, HttpCode, Message } from "../libs/Errors";
import { SellerRequest } from "../libs/types/user";
import { ProductInput} from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enums";

const productController: T = {};
const productService = new ProductService()


// BSSR APIs
productController.goAddProduct = ( req: Request, res: Response) => {
    try{
        console.log("Seller, addProduct")
        res.render("addProduct")
    }catch(err){
        console.log("Error, addProduct", err)
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.getAllProducts = async (req: Request, res: Response) => {
    try {
        console.log("getAllProducts");
    
        // 1. Query parametrlarni olish
        const search = req.query.search ? String(req.query.search) : "";
        const productCollection = req.query.productCollection ? String(req.query.productCollection) : "";
        const order = req.query.order ? String(req.query.order) : "";
        
        const page = Number(req.query.page) || 1;
        const limit = 10; // Bitta sahifada 10 ta mahsulot

        const { products, total } = await productService.getAllProducts({
            page,
            limit,
            search,
            productCollection: productCollection ? (ProductCollection[productCollection as keyof typeof ProductCollection]) : undefined,
            order
        });
        
    
        const totalPages = Math.ceil(total / limit);

        res.render("products", { 
            products: products,     
            search: search,
            productCollection: productCollection,
            order: order,
            currentPage: page,
            totalPages: totalPages
        });

    } catch (err) {
        console.log("Error, getAllProducts:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
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
        res.send(`<script>alert("Successfully added product"); window.location.replace('/seller/products')</script>`);

    }catch(err){
        console.log("Error addProduct", err);
        const message = err instanceof Errors? err.message: Message.SOMETHING_WENT_WRONG;
        res.send(`<script>alert(${message}); window.location.replace('/seller/product/add')</script>`)
    }
};


productController.updateChosenProduct = async(req: Request, res: Response) => {
    try{
        console.log("updateChosenProduct")
        console.log("reqbody", req.body)
        const id = req.params.id;
        console.log("id", id)

        const result = await productService.updateChosenProduct(id, req.body)
        res.status(HttpCode.OK).json({data: result})
    }catch(err){
        console.log("Error , updateChosenProduct", err);
        if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard); 
    }
};


// SSR APIs


export default productController