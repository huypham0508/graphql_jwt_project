"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateOTP() {
    const digits = 6;
    return Math.floor(Math.random() * 10 ** digits)
        .toString()
        .padStart(digits, "0");
}
exports.default = generateOTP;
//# sourceMappingURL=generate_otp.js.map