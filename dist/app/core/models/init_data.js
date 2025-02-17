"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_model_1 = require("./role/role.model");
const initializeModels = async () => {
    await (0, role_model_1.seedRoles)();
};
exports.default = initializeModels;
//# sourceMappingURL=init_data.js.map