"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = exports.Otp = exports.ConfigBcrypt = exports.Role = exports.ConfigJWT = exports.ConfigServer = exports.ConfigMongo = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class ConfigMongo {
}
exports.ConfigMongo = ConfigMongo;
ConfigMongo.URI_DATABASE = "mongodb+srv://admin2:oORArVKaZaSxgjfb@cluster0.37vmswz.mongodb.net/?retryWrites=true&w=majority";
class ConfigServer {
}
exports.ConfigServer = ConfigServer;
ConfigServer.app = (0, express_1.default)();
ConfigServer.PORT = process.env.PORT || 4000;
ConfigServer.WINDOW_MS = 2 * 60 * 1000;
ConfigServer.MAX_REQUESTS = 75;
class ConfigJWT {
}
exports.ConfigJWT = ConfigJWT;
ConfigJWT.create_token_type = "createToken";
ConfigJWT.refresh_token_type = "refreshToken";
ConfigJWT.JWT_ACCESS_PRIVATE_KEY = process.env.JWT_ACCESS_PRIVATE_KEY;
ConfigJWT.JWT_REFRESH_PRIVATE_KEY = process.env.JWT_REFRESH_PRIVATE_KEY;
ConfigJWT.REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKI_NAME;
class Role {
}
exports.Role = Role;
Role.ALL = "ALL";
Role.FORGOT_PASSWORD = "FORGOT_PASSWORD";
class ConfigBcrypt {
}
exports.ConfigBcrypt = ConfigBcrypt;
ConfigBcrypt.saltRounds = 10;
class Otp {
}
exports.Otp = Otp;
Otp.ACCESS_TOKEN = process.env.ACCESS_TOKEN_OAUTH;
Otp.REFRESH_TOKEN = process.env.REFRESH_TOKEN_OAUTH;
Otp.CLIENT_ID = process.env.CLIENT_ID;
Otp.CLIENT_SECRET = process.env.CLIENT_SECRET;
Otp.REDIRECT_URI = "https://developers.google.com/oauthplayground";
Otp.MY_EMAIL = process.env.MY_EMAIL;
Otp.EXPIRATION_TIME = 2 * 60 * 1000;
class Redis {
}
exports.Redis = Redis;
Redis.SAVE_TIME = 1800;
Redis.STATUS_REDIS_CONNECT = {
    "CONNECT": "connect",
    "END": "end",
    "RE_CONNECT": "reconnect",
    "ERROR": "error",
};
Redis.REDIS_CONNECT_TIMEOUT = 30000;
Redis.PORT = 19865;
Redis.OPTIONS_PRO = {
    username: 'admin',
    password: 'Huy@11072002',
    socket: {
        host: 'redis-19865.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 19865
    }
};
Redis.OPTIONS_DEV = {
    socket: {
        host: 'localhost',
        port: 6379,
    }
};
//# sourceMappingURL=index.js.map