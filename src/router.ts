import express from 'express';
import path from 'path';
import  userController from './controllers/user.controller';
import ordersController from './controllers/orders.controller';
import productController from './controllers/product.controller';
const router  = express.Router();

router.get('/', userController.goHome)
router.get('/customer/sellers', userController.getSellers);
// router.get('/user/top-sellers', userController.getTopSellers);

// Auth Routers
router.post("/auth/signup", userController.signup);
router.post("/auth/login", userController.login);
router.post("/auth/logout", userController.logout);


// Product
router
.get("/customer/products", productController.getProducts)
.get("/customer/product/detail/:id",

    productController.getProduct)

// Order
router
.post("/order/create",
    userController.verifyAuth,
    ordersController.createOrder)
.post("/order/update",
    userController.verifyAuth,
    ordersController.updateOrder)

router
.get("/order/all",
    userController.verifyAuth,
    ordersController.getMyOrders)

export default router;
