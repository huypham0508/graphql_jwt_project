"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const refreshToken = express_1.default.Router();
refreshToken.get("/", async (req, res) => {
    console.log(req.cookies);
    res.json({
        success: true,
    });
});
exports.default = refreshToken;
//# sourceMappingURL=refreshToken.js.map