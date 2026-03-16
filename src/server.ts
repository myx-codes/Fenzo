import dotenv from 'dotenv';
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env"
});

import mongoose from 'mongoose';
// app o'rniga serverni import qilamiz
import app, { server } from './app'; 

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL as string)
.then((data) => {
    console.log("MongoDB connected Successfully");
    const PORT = process.env.PORT ?? 3001;

    // DIQQAT: app.listen emas, server.listen bo'lishi shart!
    server.listen(PORT, function(){
        console.info(`Server is running on: ${PORT}`);
        console.info(`Seller Page is running on: http://localhost:${PORT}/seller`);
    });
}).catch((err) => {
    console.log("MongoDb connection failed", err);
});