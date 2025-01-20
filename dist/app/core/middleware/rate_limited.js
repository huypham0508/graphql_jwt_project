"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../../config");
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.ConfigServer.WINDOW_MS,
    max: config_1.ConfigServer.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        var _a;
        const retryAfter = ((_a = req.rateLimit) === null || _a === void 0 ? void 0 : _a.resetTime)
            ? Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000)
            : 0;
        res.status(429).send({
            code: 500,
            success: false,
            second: retryAfter,
            message: `Too many requests. Please try again after ${retryAfter} seconds.`,
        });
    },
});
const RateLimitMiddleware = async ({ context }, next) => {
    return new Promise((resolve) => {
        apiLimiter(context.req, context.res, () => {
            resolve(next());
        });
    });
};
exports.RateLimitMiddleware = RateLimitMiddleware;
//# sourceMappingURL=rate_limited.js.map