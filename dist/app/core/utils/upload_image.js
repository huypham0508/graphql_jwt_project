"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        console.log(req, file);
        const currentPath = path_1.default.resolve(__dirname);
        let uploadPath = "src/public/uploads/";
        if (currentPath.includes("dist")) {
            uploadPath = "dist/public/uploads/";
        }
        return cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        console.log(req, file);
        return cb(null, `${Date.now()}_${file.originalname}`);
    },
});
exports.uploadImage = (0, multer_1.default)({ storage: storage });
//# sourceMappingURL=upload_image.js.map