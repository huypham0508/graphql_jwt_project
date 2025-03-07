import dotenv from "dotenv";
import multer from "multer";
dotenv.config();
// Multer configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req, file);
    let uploadPath = "public/uploads/";
    // const currentPath = path.resolve(__dirname);
    // let uploadPath = "src/public/uploads/";
    // if (currentPath.includes("dist")) {
    //   uploadPath = "dist/public/uploads/";
    // }
    return cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log(req, file);
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const uploadImage = multer({ storage: storage });
