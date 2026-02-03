import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { UserInput, User, LoginInput, ExtendedRequest } from "../libs/types/user";
import UserService from "../models/User.service";
import { Errors, HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.Service";
import { AUTH_TIMER } from "../libs/config";

const userController: T = {};
const userService = new UserService()
const authService = new AuthService()


userController.goHome = ( req: Request, res: Response) => {
    try{
        console.log("User, goHome")
        res.json("User Home")
    }catch(err){
        console.log("Error, goHome", err)
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


userController.getSellers = async (req: Request, res: Response) => {
    try {
        console.log("getSellers");
        const result = await userService.getSellers();
        res.status(200).json(result);
    } catch (err) {
        console.log("Error, getSellers:", err);
        
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(500).json({ message: "Internal Server Error" });
    }
};

userController.signup = async(req: Request, res: Response) =>{
    try{
        console.log("Signup")
        const input: UserInput = req.body,
        result: User = await userService.signup(input);
        const token = await authService.createToken(result);
        res.cookie("accessToken", token, {
            maxAge: AUTH_TIMER * 3600 *1000,
            httpOnly: false
        })
        res.status(HttpCode.CREATED).json({user: result, accessToken: token})
     
    }catch(err){
        console.log("Error, Signup", err)
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

userController.login = async (req: Request, res: Response) => {
    try{
        const input: LoginInput = req.body;
        const result: User = await userService.login(input)
        const token = await authService.createToken(result);
        res.cookie("accessToken", token, {
            maxAge: AUTH_TIMER * 3600 * 1000,
            httpOnly: false
        })
        res.status(HttpCode.OK).json({user: result, accessToken: token});

    }catch(err){
        console.log("Error, Login", err)
        if(err instanceof Errors)res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


userController.verifyAuth = async( req: ExtendedRequest, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies["accessToken"];
        if(token)req.user = await authService.checkAuth(token);
        if(!req.user) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
        next();
    }catch(err){
        console.log("Error verifyAuth", err);
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

userController.retrieveAuth = async ( req: ExtendedRequest, res: Response, next: NextFunction) => {

    try{
        const token = req.cookies["accessToken"];
        if(token) req.user = await authService.checkAuth(token);
        next();
    }catch(err){
        console.log("Error retrieveAuth", err);
        next();
    }
}


export default userController;