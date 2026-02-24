import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { UserInput, User, LoginInput, ExtendedRequest, UserProfileUpdateInput } from "../libs/types/user";
import UserService from "../models/User.service";
import ProductService from "../models/Product.service";
import OrderService from "../models/Orders.service";
import { Errors, HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.Service";
import { AUTH_TIMER, shapeIntoMongooseObjectId } from "../libs/config";
import { UserType } from "../libs/enums/user.enums";

const userController: T = {};
const userService = new UserService();
const authService = new AuthService();
const productService = new ProductService();
const orderService = new OrderService();


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
            maxAge: AUTH_TIMER * 3600 * 1000,
            httpOnly: false,
            path: "/",
            sameSite: "lax",
        });
        if (req.session) {
            req.session.user = result;
            req.session.save(() => {});
        }
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
        const result: User = await userService.login(input);
        const token = await authService.createToken(result);
        res.cookie("accessToken", token, {
            maxAge: AUTH_TIMER * 3600 * 1000,
            httpOnly: false,
            path: "/",
            sameSite: "lax",
        });
        if (req.session) {
            req.session.user = result;
            req.session.save(() => {});
        }
        res.status(HttpCode.OK).json({user: result, accessToken: token});

    }catch(err){
        console.log("Error, Login", err)
        if(err instanceof Errors)res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

userController.logout = async ( req: ExtendedRequest, res: Response) => {
    try{
        console.log("Customer, logout");
        res.cookie("accessToken", null, {maxAge: 0, httpOnly: true});
        res.status(HttpCode.OK).json({logout: true});
    }catch(err){
        console.log("Error Customer, Logout", err);
        if(err instanceof Errors)res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }

}


userController.verifyAuth = async( req: ExtendedRequest, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies["accessToken"] ?? (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : undefined);
        if (token) req.user = await authService.checkAuth(token);
        if (!req.user && (req as any).session?.user) req.user = (req as any).session.user;
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
        const token = req.cookies["accessToken"] ?? (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : undefined);
        if (token) req.user = await authService.checkAuth(token);
        if (!req.user && (req as any).session?.user) req.user = (req as any).session.user;
        next();
    }catch(err){
        console.log("Error retrieveAuth", err);
        next();
    }
};

userController.getUser = async (req: ExtendedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user?._id) {
            return res.status(HttpCode.UNAUTHORIZED).json({ message: Message.NOT_AUTHENTICATED });
        }
        const result = await userService.getUser(user._id);
        res.status(HttpCode.OK).json({ user: result });
    } catch (err) {
        console.log("Error getUser", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

userController.getCustomer = async (req: ExtendedRequest, res: Response) => {
    try {
        const currentUser = req.user;
        if (!currentUser?._id) {
            return res.status(HttpCode.UNAUTHORIZED).json({ message: Message.NOT_AUTHENTICATED });
        }
        const id = shapeIntoMongooseObjectId(req.params.id);
        const currentId = shapeIntoMongooseObjectId(currentUser._id);
        const isOwnProfile = currentId.toString() === id.toString();
        const isSeller = currentUser.userType === UserType.SELLER;
        if (!isOwnProfile && !isSeller) {
            return res.status(HttpCode.FORBIDDEN).json({ message: Message.NOT_ALLOWED });
        }
        const result = await userService.getCustomer(id);
        res.status(HttpCode.OK).json({ user: result });
    } catch (err) {
        console.log("Error getCustomer", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

userController.getSeller = async (req: ExtendedRequest, res: Response) => {
    try {
        const id = shapeIntoMongooseObjectId(req.params.id);
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const [user, productsAddedCount, products, productsSold, totalRevenue, topSellingProducts] = await Promise.all([
            userService.getSeller(id),
            productService.getSellerProductsCount(id),
            productService.getSellerProducts(id, limit),
            orderService.getSellerTotalUnitsSold(id),
            orderService.getSellerRevenue(id),
            orderService.getTopSellingProducts(id, 5),
        ]);
        res.status(HttpCode.OK).json({
            user,
            productsAdded: productsAddedCount,
            products,
            productsSold,
            totalRevenue,
            topSellingProducts,
        });
    } catch (err) {
        console.log("Error getSeller", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

userController.updateProfile = async (req: ExtendedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user?._id) {
            return res.status(HttpCode.UNAUTHORIZED).json({ message: Message.NOT_AUTHENTICATED });
        }
        const body = req.body || {};
        const input: UserProfileUpdateInput = {};
        if (body.userNick !== undefined && body.userNick !== "") input.userNick = String(body.userNick).trim();
        if (body.userPhone !== undefined && body.userPhone !== "") input.userPhone = String(body.userPhone).trim();
        if (body.userAddress !== undefined) input.userAddress = String(body.userAddress).trim();
        if (body.userDesc !== undefined) input.userDesc = String(body.userDesc).trim();
        if (body.userPassword !== undefined && body.userPassword !== "") input.userPassword = body.userPassword;
        if (req.file?.path) {
            input.userImage = req.file.path.replace(/\\/g, "/");
        } else if (body.userImage !== undefined && body.userImage !== "") {
            input.userImage = String(body.userImage).trim();
        }
        const result = await userService.updateProfile(user._id, input);
        if (req.session) {
            req.session.user = result;
            req.session.save(() => {});
        }
        res.status(HttpCode.OK).json({ user: result });
    } catch (err) {
        console.log("Error updateProfile", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default userController;