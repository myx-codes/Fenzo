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
        .findOne({
            userId: input.userId,
            viewRefId: input.viewRefId,
            viewGroup: input.viewGroup,
        })
        .lean<View>()
        .exec();
        return view;
    };

    public async insertUserView(input: ViewInput): Promise<View>{
        try{
            const result = await this.viewModel.create(input);
            const view = result.toObject() as View;
            console.log("[insertUserView] created", { viewId: view._id, userId: input.userId, viewRefId: input.viewRefId, viewGroup: input.viewGroup });
            return view;
        }catch(err){
            console.error("[insertUserView] Error", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }
};

export default ViewService;