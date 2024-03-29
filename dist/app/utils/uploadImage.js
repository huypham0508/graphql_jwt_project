"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        console.log(req, file);
        let typePath = "dist";
        if (process.env.NODE_ENV === "development") {
            typePath = "src";
        }
        return cb(null, `${typePath}/public/uploads/`);
    },
    filename: function (req, file, cb) {
        console.log(req, file);
        return cb(null, `${Date.now()}_${file.originalname}`);
    },
});
exports.uploadImage = (0, multer_1.default)({ storage: storage });
//# sourceMappingURL=uploadImage.js.map