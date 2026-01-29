import express from  'express';
import path from 'path';
import sellerController from './controllers/seller.controller';
import productController from './controllers/product.controller';
import ordersController from './controllers/orders.controller';
import makeuploader from "./libs/utils/uploader";

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
.get("/product/all", 
    sellerController.verifySeller, 
    productController.getAllProducts)

routerSeller
.post("/product/add", 
    sellerController.verifySeller,
    makeuploader("products").array("productImages", 5),
    productController.addProduct)


routerSeller
.post("/customer/update", sellerController.updateChosenUser)
.post("/product/:id", productController.updateChosenProduct)


export default routerSeller;