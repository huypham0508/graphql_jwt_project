import multer from "multer";
// Multer configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req, file);
    const typePath = process.env.NODE_ENV === "production" ? "dist" : "src";
    return cb(null, `${typePath}/public/uploads/`);
  },
  filename: function (req, file, cb) {
    console.log(req, file);
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const uploadImage = multer({ storage: storage });
