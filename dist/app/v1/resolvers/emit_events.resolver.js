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
exports.EmitEventResolver = void 0;
const apollo_server_core_1 = require("apollo-server-core");
const type_graphql_1 = require("type-graphql");
const events_controller_1 = require("../controllers/events.controller");
const auth_1 = require("../../core/middleware/auth");
const room_model_1 = __importDefault(require("../../core/models/chat/room.model"));
const IMutationResponse_1 = require("../../core/types/response/IMutationResponse");
let EmitEventResolver = exports.EmitEventResolver = class EmitEventResolver {
    async typing(roomId, context) {
        const { user, req } = context;
        try {
            if (!roomId) {
                throw new apollo_server_core_1.ApolloError(req.t("roomId is required"));
            }
            const room = await room_model_1.default.findById(roomId).lean();
            if (!room) {
                throw new apollo_server_core_1.ApolloError(req.t("Room not found"));
            }
            (0, events_controller_1.doEvents)({
                eventData: {
                    type: "typing",
                    op: "add",
                    event: {
                        userTyping: user.id,
                        roomId: roomId,
                    },
                    recipients: room.participants
                        .filter((p) => p.toString() !== user.id)
                        .map((p) => p.toString()),
                },
            });
            return {
                code: 200,
                success: true,
            };
        }
        catch (error) {
            return {
                code: 500,
                success: false,
                message: error.message,
            };
        }
    }
};
__decorate([
    (0, type_graphql_1.Mutation)((_return) => IMutationResponse_1.ResponseData),
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    __param(0, (0, type_graphql_1.Arg)("roomId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmitEventResolver.prototype, "typing", null);
exports.EmitEventResolver = EmitEventResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], EmitEventResolver);
//# sourceMappingURL=emit_events.resolver.js.map