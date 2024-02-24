"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const refreshToken_1 = __importDefault(require("./routes/refreshToken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const uploadImage_1 = require("./utils/uploadImage");
const uploadImageController_1 = require("./controllers/uploadImageController");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
exports.app = app;
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
app.use("/refreshToken", refreshToken_1.default);
app.post("/upload", uploadImage_1.uploadImage.fields([{ name: "file", maxCount: 1 }]), uploadImageController_1.handleUpload);
//# sourceMappingURL=app.js.map