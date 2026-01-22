import express from 'express';
import path from 'path';
import  userController from './controllers/user.controller';
import ordersController from './controllers/orders.controller';
const router  = express.Router();

router.get('/', userController.goHome)
router.get('/user/sellers', userController.getSellers);
// router.get('/user/top-sellers', userController.getTopSellers);

// Auth Routers
router.post("/auth/signup", userController.signup);
router.post("/auth/login", userController.login);
// router.post("/auth/logout", userController.logout);

// //TODO: Password Reset
// router.post("/auth/forgot-password", userController.forgotPassword);
// router.post("/auth/reset-password", userController.resetPassword);

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
