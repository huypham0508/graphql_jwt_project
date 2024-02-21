"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config/config");
const OAuth2Client = new googleapis_1.google.auth.OAuth2(config_1.Otp.CLIENT_ID, config_1.Otp.CLIENT_SECRET, config_1.Otp.REDIRECT_URI);
OAuth2Client.setCredentials({ refresh_token: config_1.Otp.REFRESH_TOKEN });
async function sendEmail(mailOptions) {
    let ACCESS_TOKEN = "";
    mailOptions.from = config_1.Otp.MY_EMAIL;
    ACCESS_TOKEN = await OAuth2Client.getAccessToken();
    const transport = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: config_1.Otp.MY_EMAIL,
            clientId: config_1.Otp.CLIENT_ID,
            clientSecret: config_1.Otp.CLIENT_SECRET,
            refreshToken: config_1.Otp.REFRESH_TOKEN,
            accessToken: ACCESS_TOKEN,
        },
        tls: {
            rejectUnauthorized: true,
        },
    });
    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (err, info) => {
            if (err)
                reject(err);
            resolve(info);
        });
    });
}
exports.default = sendEmail;
//# sourceMappingURL=sendEmail.js.map