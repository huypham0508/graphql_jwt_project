"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const refresh_token_controller_1 = require("../controllers/refresh_token.controller");
const refreshToken = (0, express_1.Router)();
refreshToken.get("/", refresh_token_controller_1.handleRefreshToken);
exports.default = refreshToken;
//# sourceMappingURL=refresh_token.js.map