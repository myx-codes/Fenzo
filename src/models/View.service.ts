import { View, ViewInput } from "../libs/types/view";
import ViewModel  from "../schema/View.model"
import { Errors, HttpCode, Message } from "../libs/Errors";



class ViewService {
    private readonly viewModel;

    constructor(){
        this.viewModel = ViewModel;
    }

    public async checkViewExistance(input: ViewInput):  Promise<View>{
        const view = await this.viewModel
        .findOne({userId: input.userId, viewRefId: input.viewRefId})
        .lean<View>()
        .exec();
        return view;
    };

    public async insertUserView(input: ViewInput): Promise<View>{
        try{
            const result = await this.viewModel.create(input);
            return result.toObject() as View
        }catch(err){
            console.log("Error insertUserView", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }
};

export default ViewService;