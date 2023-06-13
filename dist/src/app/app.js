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
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
app.use((0, cookie_parser_1.default)());
app.use("/refreshToken", refreshToken_1.default);
//# sourceMappingURL=app.js.map