"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionMiddleware = void 0;
function ExceptionMiddleware({ message, status, }) {
    return JSON.stringify({
        success: false,
        status: status !== null && status !== void 0 ? status : 500,
        message,
    });
}
exports.ExceptionMiddleware = ExceptionMiddleware;
//# sourceMappingURL=exception.js.map