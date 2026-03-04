import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app'
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL as string)
.then((data) => {
    console.log("MondoDB connected Successfully")
    const PORT = process.env.PORT ?? 3001;
// '0.0.0.0' qo'shildi - bu barcha tarmoq interfeyslarini tinglashni anglatadi
app.listen(PORT as number, '0.0.0.0', function(){
    console.info(`Server is running on: ${PORT}`);
    // Endi bu yerda IP manzilingizni ko'rsatish foydaliroq
    console.info(`Seller Page is running on: http://192.168.219.101:${PORT}/seller`);
});
}).catch((err) => {
    console.log("MongoDb connection failed", err);
})