import { T } from "../libs/types/common";
import { Request, Response } from "express"

const sellerController: T = {};

sellerController.goHome = (req: Request, res: Response) => {
    res.send ("seller go home")
}



export default sellerController;