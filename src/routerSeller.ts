import express from  'express';
import path from 'path';
import sellerController from './controllers/seller.controller';

const routerSeller = express.Router();

routerSeller
.get("/", sellerController.goHome)
.get("/signup", sellerController.getSignup)
.get("/login", sellerController.getLogin)

routerSeller
.post("/signup", sellerController.processSignup)
.post("/login", sellerController.processLogin);

routerSeller
.get("/dashboard", sellerController.goDashboard)
.get("/customers", sellerController.getCustomers)
.get("/logout", sellerController.logout);

export default routerSeller;