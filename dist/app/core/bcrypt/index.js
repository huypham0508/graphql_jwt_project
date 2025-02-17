"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bcrypt = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../../config");
class Bcrypt {
    static hashPassword(plaintextPassword) {
        return bcrypt_1.default.hash(plaintextPassword, config_1.ConfigBcrypt.saltRounds);
    }
    static comparePassword(plaintextPassword, hash) {
        return bcrypt_1.default.compare(plaintextPassword, hash);
    }
}
exports.Bcrypt = Bcrypt;
//# sourceMappingURL=index.js.map