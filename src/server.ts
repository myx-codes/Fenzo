import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app'

dotenv.config();

mongoose.connect(process.env.MONGO_URL as string)
.then((data) => {
    console.log("MondoDB connected Successfully")
    const PORT = process.env.PORT ?? 3001;
    app.listen(PORT, function(){
        console.info(`Server is running on: ${PORT}`);
        console.info(`Seller Page is runnig on: http://localhost:${PORT}/seller `)
    })
}).catch((err) => {
    console.log("MongoDb connection failed", err);
})