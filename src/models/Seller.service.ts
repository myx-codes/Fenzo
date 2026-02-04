import UserModel from "../schema/User.model";
import * as bcrypt from "bcryptjs"
import { UserInput, User, LoginInput, CustomersResponse, CustomerInQuery, UserUpdateInput } from "../libs/types/user";
import { Errors, HttpCode, Message } from "../libs/Errors";
import { UserStatus, UserType } from "../libs/enums/user.enums";
import { shapeIntoMongooseObjectId } from "../libs/config";



class SellerService{
    private readonly userModel
    constructor(){
        this.userModel = UserModel;
    }


    public async getCustomers(inquery: CustomerInQuery) {
    
    // 1. $MATCH: Dastlabki filtrlash
    const match: any = { userType: UserType.CUSTOMER };

    // A) Agar "search" yozilgan bo'lsa (Ism yoki Telefon orqali qidirish)
    if (inquery.search) {
        match.$or = [
            { userNick: { $regex: new RegExp(inquery.search, "i") } }, // "i" = case insensitive (Katta-kichik harf farqi yo'q)
            { userPhone: { $regex: new RegExp(inquery.search, "i") } }
        ];
    }

    // B) Agar "status" tanlangan bo'lsa (ACTIVE, BLOCK)
    if (inquery.userStatus) {
        match.userStatus = inquery.userStatus;
    }

    // 2. $SORT: Tartiblash (Default: Eng yangilar tepada)
    const sort: any = { [inquery.order || 'createdAt']: -1 };

    // 3. AGGREGATE so'rovini bajarish
    const result = await this.userModel.aggregate([
        { $match: match },     // Kerakli odamlarni saralab olish
        { $sort: sort },       // Tartiblash
        { $skip: (inquery.page - 1) * inquery.limit }, // Sahifalash: O'tkazib yuborish
        { $limit: inquery.limit } // Sahifalash: Cheklash
    ]).exec();

    // 4. TOTAL COUNT: Jami nechta ekanligini hisoblash (Pagination tugmalari uchun)
    // Aggregation bilan birga countDocuments ishlatish eng optimal yo'l.
    const total = await this.userModel.countDocuments(match);

    return { 
        list: result, 
        totalPage: Math.ceil(total / inquery.limit) 
    };
  };

  public async updateChosenUser(input: UserUpdateInput): Promise<User>{
    input._id = shapeIntoMongooseObjectId(input._id);
    const data = input._id
    console.log("DATA:", data)
    const result = await this.userModel
    .findByIdAndUpdate({_id: input._id}, input, {new: true})
    .lean()
    .exec();
    if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result as User
  };

    public async processSignup(input: UserInput): Promise<User> {
    const exist = await this.userModel
      .findOne({ userNick: input.userNick })
      .lean()
      .exec();
    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);

    const salt = await bcrypt.genSalt();
    input.userPassword = await bcrypt.hash(input.userPassword, salt);

    try {
      const result = await this.userModel.create(input);
      result.userPassword = "";
      return result as User;
    } catch (err) {
        console.log("asl xato", err)
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  };

  public async getSellerSettings(id: string) {
        const user = await this.userModel.findById(id).lean();
        if (!user) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return user;
  };


  public async updateSellerSettings(id: string, input: UserInput) {
        
        // Inputlarni tozalash
        if(input.userNick) input.userNick = input.userNick.trim();
        // Boshqa validatsiyalar...

        const result = await this.userModel.findByIdAndUpdate(id, input, {
            new: true // Yangilangan versiyani qaytaradi
        }).lean();

        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result;
  };


  public async processLogin(input: LoginInput): Promise<User>{
    const user = await this.userModel.findOne(
        {userNick: input.userNick},
        {userNick:1, userPassword:1}
    ).exec();
    console.log("LOGIN DB SELLER:", user);
    if(!user) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK)

    const isMatch = await bcrypt.compare
    (input.userPassword, user.userPassword);

    if(!isMatch) throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

    return await this.userModel.findOne(user._id).exec() as User
    ;
  };

  public async addCustomerPoint(user: User, point: Number): Promise<User>{
    console.log("addCustomerPoint");
       const userId = shapeIntoMongooseObjectId(user._id);
      const result =  await this.userModel.findOneAndUpdate(
        {
        _id: userId,
        userType: UserType.CUSTOMER,
      },
      {
        $inc: {userPoints: point}
      },
      {new: true}
    )
    .exec();

    return result as User
  }

};

export default SellerService;