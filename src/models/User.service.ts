import UserModel from "../schema/User.model";
import * as bcrypt from "bcryptjs"
import { UserInput, User, LoginInput } from "../libs/types/user";
import { Errors, HttpCode, Message } from "../libs/Errors";
import { UserStatus, UserType } from "../libs/enums/user.enums";



class UserService{
    private readonly userModel
    constructor(){
        this.userModel = UserModel;
    }

    public async getSellers(): Promise<User[]>{
        const result = await this.userModel
        .find({userType: UserType.SELLER})
        .lean()
        .exec()
        if(!result || result.length === 0) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
        return result as User[];
    }


    public async signup (input: UserInput): Promise<User>{
        const salt = await bcrypt.genSalt();
        input.userPassword = await bcrypt.hash(input.userPassword, salt);

        try{
            const result = await this.userModel.create(input);
            result.userPassword = "";
            return result.toJSON() as User;
        }catch(err){
            console.log("Error, User.service signup")
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE)
        }
    };


    public async login( input: LoginInput): Promise<User>{
        const user = await this.userModel.findOne(
            { userNick: input.userNick},
            { userNick:1, userPassword:1}
        ).exec();

        if(!user) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK)

        const isMatch = await bcrypt.compare(
            input.userPassword,
            user.userPassword,
        );

        if(!isMatch) throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        return await this.userModel.findById(user._id).lean().exec() as User;
    }

}

export default UserService;