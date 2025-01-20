"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_controller_1 = require("../controllers/events.controller");
const events = (0, express_1.Router)();
events.get("", events_controller_1.handleEvents);
events.post("/register", events_controller_1.handleEventRegister);
exports.default = events;
//# sourceMappingURL=events.js.map