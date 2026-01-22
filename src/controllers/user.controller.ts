import { Request, Response } from "express";
import { T } from "../libs/types/common";
import { UserInput, User, LoginInput } from "../libs/types/user";
import UserService from "../models/User.service";
import { Errors } from "../libs/Errors";

const userController: T = {};
const userService = new UserService()


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
        res.json({user: result})
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
        //TODO: Auth by Tokens

        res.json(result);

    }catch(err){
        console.log("Error, Login", err)
        if(err instanceof Errors)res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}


export default userController;