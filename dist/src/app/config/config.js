"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigBcrypt = exports.ConfigJWT = exports.ConfigServer = exports.ConfigMongo = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class ConfigMongo {
}
exports.ConfigMongo = ConfigMongo;
ConfigMongo.URI_DATABASE = "mongodb+srv://admin2:oORArVKaZaSxgjfb@cluster0.37vmswz.mongodb.net/?retryWrites=true&w=majority";
class ConfigServer {
}
exports.ConfigServer = ConfigServer;
ConfigServer.PORT = process.env.PORT || 4000;
class ConfigJWT {
}
exports.ConfigJWT = ConfigJWT;
ConfigJWT.create_token_type = "createToken";
ConfigJWT.refresh_token_type = "refreshToken";
ConfigJWT.JWT_ACCESS_PRIVATE_KEY = "process.env.JWT_ACCESS_PRIVATE_KEY";
ConfigJWT.JWT_REFRESH_PRIVATE_KEY = "process.env.JWT_REFRESH_PRIVATE_KEY";
ConfigJWT.REFRESH_TOKEN_COOKIE_NAME = "process.env.REFRESH_TOKEN_COOKI_NAME";
class ConfigBcrypt {
}
exports.ConfigBcrypt = ConfigBcrypt;
ConfigBcrypt.saltRounds = 10;
//# sourceMappingURL=config.js.map