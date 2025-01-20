"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRoles = exports.IRole = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const model_name_1 = __importDefault(require("../../../core/constants/model_name"));
const type_graphql_1 = require("type-graphql");
const Schema = mongoose_1.default.Schema;
const model = mongoose_1.default.model;
let IRole = exports.IRole = class IRole {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", Object)
], IRole.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], IRole.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => [String]),
    __metadata("design:type", Array)
], IRole.prototype, "permissions", void 0);
exports.IRole = IRole = __decorate([
    (0, type_graphql_1.ObjectType)()
], IRole);
const RoleSchema = new Schema({
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
}, { timestamps: true });
const RoleModel = model(model_name_1.default.ROLE, RoleSchema);
const seedRoles = async () => {
    try {
        const roles = await RoleModel.find({});
        if (roles.length === 0) {
            console.log("No roles found, creating default roles...");
            const defaultRoles = [
                { name: "admin", permissions: [] },
                { name: "member", permissions: [] },
            ];
            await RoleModel.insertMany(defaultRoles);
            console.log("Default roles created successfully.");
        }
        else {
            console.log("Roles already exist.");
        }
    }
    catch (error) {
        console.error("Error initializing roles:", error);
    }
};
exports.seedRoles = seedRoles;
exports.default = RoleModel;
//# sourceMappingURL=role.model.js.map