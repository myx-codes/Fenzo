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

// 1. Sahifani ochish va ma'lumotni yetkazish
productController.getUpdateProduct = async (req: Request, res: Response) => {
    try {
        console.log("getUpdateProduct");
        const id = req.params.id;
        
        // Servicedan ID bo'yicha ma'lumotni olamiz
        const result = await productService.getProduct(id);

        // productDetail.ejs ga yuboramiz
        res.render("productDetail", { product: result });
        
    } catch (err) {
        console.log("Error getUpdateProduct:", err);
        res.redirect("/seller/products");
    }
};


productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");

    const id = req.params.id;

    //eski productni olib kelamiz
    const oldProduct = await productService.getProductById(id);

    // yangi yuklangan rasmlar (agar bo‘lsa)
    const newImages =
      req.files && Array.isArray(req.files)
        ? req.files.map((file: any) => file.path)
        : [];

    // eski + yangi rasmlarni birlashtiramiz
    const mergedImages =
      newImages.length > 0
        ? [...oldProduct.productImages, ...newImages]
        : oldProduct.productImages;

    // update uchun input tayyorlaymiz
    const input: any = {
      productName: req.body.productName,
      productDesc: req.body.productDesc,
      productStatus: req.body.productStatus,
      productCollection: req.body.productCollection,
      productType: req.body.productType,
      productImages: mergedImages,
    };

    // number maydonlarni alohida tekshirib qo‘shamiz
    if (req.body.productPrice !== undefined) {
      input.productPrice = Number(req.body.productPrice);
    }

    if (req.body.productStock !== undefined) {
      input.productStock = Number(req.body.productStock);
    }
    // update
    await productService.updateChosenProduct(id, input);

    console.log("Reqbody", req.body)
    res.redirect("/seller/products");

  } catch (err) {
    console.log("Error , updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.updateProductStatus = async (req: Request, res: Response) => {
        try {
            console.log("Status update request:", req.body);
            const { id, productStatus } = req.body;

            // Servis orqali yangilash
            const result = await productService.updateProductStatus(id, productStatus);

            // Frontga "OK" deb javob qaytarish (muhim!)
            res.json({ state: "success", data: result });
        } catch (err) {
            console.log("ERROR updateProductStatus:", err);
            if (err instanceof Errors) res.status(err.code).json(err);
            else res.status(Errors.standard.code).json(Errors.standard);
        }
    };





// SSR APIs


export default productController