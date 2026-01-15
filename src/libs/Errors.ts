export enum HttpCode {
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data found!",
    BAD_REQUEST = "Bad request!",
    TOKEN_CREATION_FAILED = "Token creation failed!",
    USED_NICK_PHONE = "Nickname or Phone number is already in use!",
    NO_USER_NICK = "No member found with this nickname!",
    WRONG_PASSWORD = "Password is incorrect!",
    NOT_AUTHENTICATED = "You need to login first!",
    BLOCKED_USER = "Your account has been blocked by Admin!",
    NO_PRODUCT_FOUND = "Product not found!",
    INSUFFICIENT_STOCK = "Product is out of stock!",
    CREATE_FAILED = "Create operation failed!",
    UPDATE_FAILED = "Update operation failed!",
    REMOVE_FAILED = "Remove operation failed!",
    UPLOAD_FAILED = "Image upload failed!",
    PROVIDE_ALLOWED_FORMAT = "Please provide valid image format (jpg, jpeg, png)!"
}

export class Errors extends Error {
    public code: HttpCode;
    public message: Message;

    // Default error (agar hech narsa kelmasa shuni ishlatadi)
    static standard = {
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG,
    };

    constructor(statusCode: HttpCode, statusMessage: Message) {
        // MUHIM: super ichiga messageni berish kerak, 
        // shunda console.log da chiroyli chiqadi.
        super(statusMessage); 
        this.code = statusCode;
        this.message = statusMessage;
    }
}