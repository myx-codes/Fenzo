import { Request, Response } from "express";
import { T } from "../libs/types/common";

const userController: T = {};

// Auth Controllers
userController.goHome = (req: Request, res: Response) => {
    res.send("User Home")
};

userController.postSignup = (req: Request, res: Response) => {
    res.send("User Signup")
};

userController.postLogin = (req: Request, res: Response) => {
    res.send("User Login")
};

userController.postLogout = (req: Request, res: Response) => {
    res.send("User Logout")
};

// TODO: Password Reset
userController.postForgotPassword = (req: Request, res: Response) => {
    res.send("User Forgot Password")
};

userController.postResetPassword = (req: Request, res: Response) => {
    res.send("User Reset Password")
};


export default userController;