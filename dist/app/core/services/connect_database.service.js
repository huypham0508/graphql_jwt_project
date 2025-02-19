"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../config");
dotenv_1.default.config();
const connectDBService = async () => {
    try {
        await mongoose_1.default.connect(config_1.ConfigMongo.URI_DATABASE, {});
        console.clear();
        console.log("MongoDB connected");
    }
    catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};
exports.default = connectDBService;
//# sourceMappingURL=connect_database.service.js.map