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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemResolver = void 0;
const type_graphql_1 = require("type-graphql");
const auth_1 = require("../../core/middleware/auth");
const role_model_1 = __importDefault(require("../../core/models/role/role.model"));
const IMutationResponse_1 = require("../../core/types/response/IMutationResponse");
const AllResolverResponse_1 = require("../../core/types/response/system/AllResolverResponse");
const RolesResponse_1 = require("../../core/types/response/system/RolesResponse");
let SystemResolver = exports.SystemResolver = class SystemResolver {
    async allResolvers(_) {
        const metadata = global.TypeGraphQLMetadataStorage;
        const queries = metadata.queries.map((q) => ({
            name: q.methodName,
            resolver: q.target.name,
            type: "Query",
        }));
        const mutations = metadata.mutations.map((m) => ({
            name: m.methodName,
            resolver: m.target.name,
            type: "Mutation",
        }));
        const subscriptions = metadata.subscriptions.map((s) => ({
            name: s.methodName,
            resolver: s.target.name,
            type: "Subscription",
        }));
        return {
            code: 200,
            success: true,
            data: [...queries, ...mutations, ...subscriptions],
        };
    }
    async roles() {
        try {
            const roles = await role_model_1.default.find();
            if (roles.length == 0) {
                return {
                    code: 200,
                    success: true,
                    message: "roles is empty",
                };
            }
            return {
                code: 200,
                success: true,
                message: "successfully",
                data: roles,
            };
        }
        catch (error) {
            throw new Error("Could not fetch posts");
        }
    }
    async addPermissionToRole(roleId, permission) {
        try {
            const role = await role_model_1.default.findById(roleId);
            if (!role) {
                return {
                    success: false,
                    code: 404,
                    message: "Role not found",
                };
            }
            if (role.permissions.includes(permission)) {
                return {
                    success: false,
                    code: 400,
                    message: "Permission already exists",
                };
            }
            role.permissions.push(permission);
            await role.save();
            return {
                success: true,
                code: 200,
                message: "Permission added successfully",
            };
        }
        catch (error) {
            console.error("Error adding permission to role:", error);
            return {
                success: false,
                code: 500,
                message: "Internal server error",
            };
        }
    }
};
__decorate([
    (0, type_graphql_1.Query)((_return) => AllResolverResponse_1.AllResolverResponse),
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemResolver.prototype, "allResolvers", null);
__decorate([
    (0, type_graphql_1.Query)((_return) => RolesResponse_1.RolesResponse),
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemResolver.prototype, "roles", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => IMutationResponse_1.ResponseData),
    __param(0, (0, type_graphql_1.Arg)("roleId")),
    __param(1, (0, type_graphql_1.Arg)("permission")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SystemResolver.prototype, "addPermissionToRole", null);
exports.SystemResolver = SystemResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], SystemResolver);
//# sourceMappingURL=system.resolver.js.map