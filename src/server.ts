import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app'

dotenv.config();

mongoose.connect(process.env.MONGO_URL as string)
.then((data) => {
    console.log("MondoDB connected Successfully")
    const PORT = process.env.Port ?? 3000;
    app.listen(PORT), function(){
        console.log(`Server is running ${PORT}`)
    }
}).catch((err) => {
    console.log("MongoDb connection failed", err);
})