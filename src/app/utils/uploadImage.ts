import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
// Multer configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req, file);
    // let typePath = "dist";
    // if (__dirname.includes("src")) {
    //   typePath = "src";
    // }
    return cb(null, `dist/public/uploads/`);
  },
  filename: function (req, file, cb) {
    console.log(req, file);
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const uploadImage = multer({ storage: storage });
