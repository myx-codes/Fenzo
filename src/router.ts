import express from 'express';
import path from 'path';
import  userController from './controllers/user.controller';
import ordersController from './controllers/orders.controller';


const router  = express.Router();


router.get("/",userController.goHome);
// router.get('/user/top-sellers', userController.getTopSellers);
// router.get('/user/sellers', userController.getSellers);

// // Auth Routers
// router.post("/auth/signup", userController.postSignup);
// router.post("/auth/login", userController.postLogin);
// router.post("/auth/logout", userController.postLogout);
// //TODO: Password Reset
// router.post("/auth/forgot-password", userController.postForgotPassword);
// router.post("/auth/reset-password", userController.postResetPassword);

// // User Profile Routers
// router.post('/users/me', userController.getMyPage);
// router.put('/users/me', userController.updateMyPage);
// router.put('/users/me/password', userController.updateMyPassword);
// router.delete('/users/me', userController.deleteMyAccount);

// // Address Routers
// router.post('/users/address', userController.addAddress);
// router.get('/users/address', userController.getAllAdresses);
// router.put('/users/address/:_id', userController.updateAddress);
// router.delete('/users/address/:_id', userController.deleteAddress);

// // Order Routers
// router.get('/orders', ordersController.getAllOrders);
// router.get('/orders/:orderId', ordersController.getOrderById);
// router.post('/orders', ordersController.createOrder);

export default router;
