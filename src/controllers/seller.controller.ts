import { Errors, HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express"
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
        console.log("DASHBOARD SESSION USER:", req.session.user);
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
        console.log("processSignup ishladi!");
        console.log("Body:", req.body);
        console.log("FILE:", req.file);

        const files = req.file;
        if(!files)
            throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

        const newUser: UserInput = req.body;
        newUser.userImage = files?.path.replace(/\\/g, "/");
        newUser.userType = UserType.SELLER;
        newUser.userImage = req.file?.path;
        console.log("SIGNUP INPUT:", newUser);

        const result = await sellerService.processSignup(newUser);

        //SESSION AUTHENTICATION
        req.session.user = result;
        req.session.save(function(){
        res.redirect("/seller/dashboard")
        });
    }
    catch(err){
        console.log("Error, processSignup:", err);
        const message = err instanceof Errors ? err.message: Message.SOMETHING_WENT_WRONG;
        res.send(`<script>alert("${message}"); window.location.replace('/seller/signup')</script>`)
    }
};


sellerController.processLogin = async ( req: SellerRequest, res: Response) => {
    try{
        console.log("processLogin")
        console.log("Body", req.body)
        const input: LoginInput = req.body;
        const result = await sellerService.processLogin(input)

        if (result.userType !== UserType.SELLER) {
            console.log("You are not Authiration user")
            throw new Errors(HttpCode.FORBIDDEN, Message.NOT_ALLOWED)
        }

        //SESSION AUTHENTICATION
        console.log("LOGIN RESULT:", result);
        req.session.user = result;
        console.log("SESSION USER AFTER SAVE:", req.session.user);
        req.session.save(function(){
        res.redirect("/seller/dashboard")
        });
        console.log(`Seller: ${req.session.user.userNick}, Id: ${req.session.user._id}`)
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

sellerController.checkAuthSession = async (req: SellerRequest, res: Response) => {
    try{
        console.log("checkAuthSession");
        if(req.session?.user)res.send(`<script> alert("${req.session.user.userNick}")</script>`);
        else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}")</script>`)
    }catch(err){
        console.log("Error, checkAuthSession", err);
        res.send(err);
    }
};


sellerController.verifySeller = (
    req: SellerRequest, 
    res: Response, 
    next: NextFunction) => {
        if(req.session?.user?.userType === UserType.SELLER){
            req.user = req.session.user;
            return next();
        }else 
            return res.status(401).send(`<script> alert("${Message.NOT_AUTHENTICATED}"); window.location.replace('/seller/login')</script>`)
    }

export default sellerController;