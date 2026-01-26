import { Errors, HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express"
import { LoginInput, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enums";
import SellerService from "../models/Seller.service";
import { SellerRequest } from "../libs/types/user";

const sellerController: T = {};
const sellerService = new SellerService();


sellerController.goHome = ( req: Request, res: Response) => {
    try{
        console.log("Seller, goHome")
        res.render("home")
    }catch(err){
        console.log("Error, goHome", err)
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


sellerController.getSignup = (req: Request, res: Response) => {
    try{
        console.log("Signup Page");
        res.render("signup");
    }
    catch(err){
        console.log("Error, go Signup", err)

    }
};


sellerController.getLogin = (req: Request, res: Response) => {
   try{
     console.log("Login Page")
    res.render("login")
   }catch(err){
    console.log("ErrorLogin Page", err)
   }
};


sellerController.goDashboard = (req: SellerRequest, res: Response) => {
    try {
        console.log("Seller, goDashboard");
        if (!req.session?.user) {
            return res.redirect("/seller/login"); 
        }
        res.render("dashboard", { 
            user: req.session.user
        });

    } catch (err) {
        console.log("Error, goDashboard", err);
        res.redirect("/seller/login");
    }
};


sellerController.getCustomers = async (req: Request, res: Response) => {
    try {
        console.log("customers");
        const result = await sellerService.getCustomers();
        res.render("customers")
    } catch (err) {
        console.log("Error, customers:", err);
        
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(500).json({ message: "Internal Server Error" });
    }
};


sellerController.processSignup = async (req: SellerRequest, res: Response) => {
    try{
        console.log("processSignup");
        console.log("body", req.body);
        const newUser: UserInput = req.body;
        newUser.userType = UserType.SELLER;
        const result = await sellerService.processSignup(newUser);

        //SESSION AUTHENTICATION
        req.session.user = result;
        req.session.save(function(){
        res.send(result)
        });
    }
    catch(err){
        console.log("Error, processSignup:", err);
        res.send(err);
    }
};


sellerController.processLogin = async ( req: SellerRequest, res: Response) => {
    try{
        console.log("processLogin")
        const input: LoginInput = req.body;
        const result = await sellerService.processLogin(input)

        //SESSION AUTHENTICATION
        req.session.user = result;
        req.session.save(function(){
        res.redirect("/seller/dashboard")
        });
    }catch(err){
        console.log("Error processLoin")
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

sellerController.logout = async (req: SellerRequest, res: Response) => {
  try {
    console.log("[Seller] logout");
    req.session.destroy(function () {
      res.redirect("/seller");
    });
  } catch (err) {
    console.error("Error, logout:", err);
    res.redirect("/seller");
  }
};



export default sellerController;