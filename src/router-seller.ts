import express from  'express';
import path from 'path';
import sellerController from './controllers/seller.controller';
import productController from './controllers/product.controller';
import ordersController from './controllers/orders.controller';
import makeuploader from "./libs/utils/uploader";
import makeUploader from './libs/utils/uploader';

const routerSeller = express.Router();

routerSeller
.get("/", sellerController.goHome)
.get("/signup", sellerController.getSignup)
.get("/login", sellerController.getLogin)
.get("/logout", sellerController.logout)

routerSeller
.post("/signup", makeuploader("users").single("userImage"),  
sellerController.processSignup)
.post("/login", sellerController.processLogin )

routerSeller
.get("/dashboard", sellerController.goDashboard)
.get("/customers", sellerController.getCustomers)
.get("/check-me", sellerController.checkAuthSession)


routerSeller
.get("/products", 
    sellerController.verifySeller, 
    productController.getAllProducts)

routerSeller
.get("/product/add", 
    sellerController.verifySeller,
    makeuploader("products").array("productImages", 5),
    productController.goAddProduct)
.post("/product/add", 
    sellerController.verifySeller,
    makeuploader("products").array("productImages", 5),
    productController.addProduct)

routerSeller
.get("/product/update/:id",
    sellerController.verifySeller,
    productController.getUpdateProduct)
.post("/product/update/:id",
    sellerController.verifySeller,
    makeUploader("products").array("productImages", 5), 
    productController.updateChosenProduct)
.post("/product/status",
    sellerController.verifySeller, 
    productController.updateProductStatus);

routerSeller
.post("/customer/update", sellerController.updateChosenUser)
.get("/settings", 
    sellerController.verifySeller,
    sellerController.getSellerSettings)
.post("/settings/update",
    sellerController.verifySeller,
    makeuploader("users").single("userImage"),   
    sellerController.updateSellerSettings )


export default routerSeller;