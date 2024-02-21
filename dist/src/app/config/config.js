"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = exports.ConfigBcrypt = exports.ConfigJWT = exports.ConfigServer = exports.ConfigMongo = void 0;
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
ConfigJWT.JWT_ACCESS_PRIVATE_KEY = process.env.JWT_ACCESS_PRIVATE_KEY;
ConfigJWT.JWT_REFRESH_PRIVATE_KEY = process.env.JWT_REFRESH_PRIVATE_KEY;
ConfigJWT.REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKI_NAME;
class ConfigBcrypt {
}
exports.ConfigBcrypt = ConfigBcrypt;
ConfigBcrypt.saltRounds = 10;
class Otp {
}
exports.Otp = Otp;
Otp.ACCESS_TOKEN = "ya29.a0AfB_byDFbyfxq8dJplv1CDcjcTq2aySNgEMwkbU_y01qLjBnzzH8VVS8StVRdDHPEDj96ZoojYVqw2Bf5CVgjxFnmxWPmpltJY0BxpUJLmnQadoEynkbolVhUbkTGwTVhM6Ccrm7fXL-3m1Fo13eT2jOUmpgqvNtthhTaCgYKAU0SARASFQHGX2Migi_fIL4hp7-A1XF3TunYlQ0171";
Otp.REFRESH_TOKEN = "1//04AgIJmadjdoUCgYIARAAGAQSNwF-L9Ir7EXxbG76ld_98odkq73nvpp8fMxRbGER5ntQGiEQWn4l3XHHHBLD3h1h7_i-6SY4HY4";
Otp.CLIENT_ID = "448160075675-bj8rn65b967s1t78bshbkg35jj5jiaf7.apps.googleusercontent.com";
Otp.CLIENT_SECRET = "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";
Otp.REDIRECT_URI = "https://developers.google.com/oauthplayground";
Otp.MY_EMAIL = "phammanhhuy1107@gmail.com";
Otp.EXPIRATION_TIME = 2 * 60 * 1000;
//# sourceMappingURL=config.js.map