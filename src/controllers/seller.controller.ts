import { Errors, HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express"
import { LoginInput, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enums";
import SellerService from "../models/Seller.service";

const sellerController: T = {};
const sellerService = new SellerService();


sellerController.goHome = ( req: Request, res: Response) => {
    try{
        console.log("Member, goHome")
        res.json("Home")
    }catch(err){
        console.log("Error, goHome", err)
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


sellerController.getSignup = (req: Request, res: Response) => {
    try{
        console.log("Signup Page");
        res.send("Signup Page");
    }
    catch(err){
        console.log("Error, go Signup", err)

    }
};


sellerController.getLogin = (req: Request, res: Response) => {
   try{
     console.log("Login Page")
    res.send("Login Page")
   }catch(err){
    console.log("ErrorLogin Page", err)
   }
};


sellerController.processSignup = async (req: Request, res: Response) => {
    try{
        console.log("processSignup");
        console.log("body", req.body);
        const newUser: UserInput = req.body;
        newUser.userType = UserType.SELLER;
        const result = await sellerService.processSignup(newUser);
        res.send(result)
    }
    catch(err){
        console.log("Error, processSignup:", err);
        res.send(err);
    }
};


sellerController.processLogin = async ( req: Request, res: Response) => {
    try{
         console.log("processLogin")
        const input: LoginInput = req.body;
        const result = await sellerService.processLogin(input)
        res.json(result);
    }catch(err){
        console.log("Error processLoin")
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}



export default sellerController;