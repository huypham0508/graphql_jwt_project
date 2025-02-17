"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("./routes/events"));
const refresh_token_1 = __importDefault(require("./routes/refresh_token"));
const auth_1 = require("../core/middleware/auth");
const express_1 = require("express");
const v1 = (0, express_1.Router)();
v1.use("/refreshToken", refresh_token_1.default);
v1.use("/events", auth_1.AuthMiddleware.verifyTokenRest, events_1.default);
exports.default = v1;
//# sourceMappingURL=index.js.map