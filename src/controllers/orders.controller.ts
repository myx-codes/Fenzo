import { Request, Response } from "express";
import { T } from '../libs/types/common';
import OrderService from "../models/Orders.service";
import { ExtendedRequest } from "../libs/types/user";
import { Errors, HttpCode, Message } from "../libs/Errors";
import { OrderInquery, OrderUpdateInput } from "src/libs/types/order";
import { OrderStatus } from "../libs/enums/order.enums";
import userController from "./user.controller";

const ordersController: T = {};
const orderService = new OrderService()

ordersController.createOrder = async(req:ExtendedRequest, res: Response) => {
    try{
        console.log("createOrder");
        const result = await orderService.createOrder(req.user, req.body)

        res.status(HttpCode.CREATED).json(result);
    }catch(err){
        console.log("Error createOrder", err);
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


ordersController.getMyOrders = async (req:ExtendedRequest, res: Response) => {
    try{
        console.log("getMyOrders");
        const { page, limit, orderStatus} = req.query;
        const inquery: OrderInquery = {
            page: Number(page),
            limit: Number(limit),
            orderStatus: orderStatus as OrderStatus,
        };
        console.log("inquery",  inquery);
        const result = await orderService.getMyOrders(req.user, inquery);
        res.status(HttpCode.CREATED).json(result);
    }catch(err){
        console.log("Error getMyOrders", err);
        if(err instanceof Errors)res.status(Errors.standard.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


ordersController.updateOrder = async (req: ExtendedRequest, res: Response) => {
    console.log("updateOrder");
    try{
        const orderId = req.params?.id || req.body?.orderId;
        const orderStatus = req.body?.orderStatus;
        if (!orderId || !orderStatus) {
            return res.status(400).json({ message: "orderId and orderStatus are required" });
        }
        const input: OrderUpdateInput = { orderId, orderStatus };
        const result = await orderService.updateOrder(req.user, input);

        res.status(HttpCode.CREATED).json(result);
    }catch(err){
        console.log("Error updateOrder");
        if(err instanceof Errors)res.status(Errors.standard.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

// BSSR APIs
ordersController.getOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect("/login"); // Render o'rniga redirect
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 100);
    const orderStatus = req.query.orderStatus as OrderStatus;

    const inquiry: OrderInquery = { page, limit, orderStatus };

    // Parallel execution for better performance
    const [orders, totalCount] = await Promise.all([
      orderService.getOrders(req.user, inquiry),
      orderService.getTotalOrdersCount(req.user, inquiry)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.render("orders", {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      },
      orderStatus: orderStatus || "ALL",
      user: req.user,
      query: req.query // Hozirgi query parametrlarni saqlash
    });

  } catch (err) {
    console.error("Error getOrders controller:", err);
    
    // User friendly error messages
    if (err instanceof Errors) {
      req.flash('error', err.message);
      return res.redirect('back');
    } else {
      req.flash('error', Message.SOMETHING_WENT_WRONG);
      return res.status(500).redirect('back');
    }
  }
};


export default ordersController