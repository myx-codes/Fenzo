import path from "path";
import multer from "multer";
import { v4 } from "uuid";
import fs from "fs"; // <-- 1. FS modulini import qiling

/** MULTER IMAGE UPLOADER **/
function getTargetImageStorage(address: string) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      
      const dir = `./uploads/${address}`; // 2. Papka yo'lini o'zgaruvchiga olamiz

      // 3. Papka mavjudligini tekshiramiz
      if (!fs.existsSync(dir)) {
        // Agar yo'q bo'lsa, yaratamiz (recursive: true -> ichma-ich papkalarni ham yaratadi)
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext;
      const random_name = v4() + extension;
      cb(null, random_name);
    },
  });
}

const makeUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({ storage });
};

export default makeUploader;