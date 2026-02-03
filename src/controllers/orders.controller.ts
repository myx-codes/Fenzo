import { Request, Response } from "express";
import { T } from '../libs/types/common';
import OrderService from "../models/Orders.service";
import { ExtendedRequest } from "../libs/types/user";
import { Errors, HttpCode, Message } from "../libs/Errors";

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
}

export default ordersController