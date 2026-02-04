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
        const input: OrderUpdateInput = req.body;
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
        console.log("getOrders");
        // Querydan parametrlarni olamiz
        const { page, limit, orderStatus } = req.query;
        
        const inquiry: OrderInquery = {
            page: Number(page),
            limit: Number(limit),
            orderStatus: orderStatus as OrderStatus,
        };

        console.log("inquiry", inquiry);

        // Service funksiyasini chaqiramiz (nomini getOrders qildik)
        const result = await orderService.getOrders(req.user, inquiry);
        console.log("getOrders Result:", JSON.stringify(result, null, 2));
        

        // ✅ O'zgarish: Ma'lumot olishda 200 (OK) ishlatiladi
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error getOrders", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default ordersController