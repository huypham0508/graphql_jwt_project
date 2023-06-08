"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Config {
}
exports.Config = Config;
Config.URI_DATABASE = process.env.CONNECT_MONGO_DB;
Config.PORT = process.env.PORT;
//# sourceMappingURL=index.js.map