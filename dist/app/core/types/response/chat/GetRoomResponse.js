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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoomsResponse = void 0;
const message_model_1 = require("../../../models/chat/message.model");
const subscription_model_1 = require("../../../models/chat/subscription.model");
const user_model_1 = require("../../../models/user/user.model");
const type_graphql_1 = require("type-graphql");
const IMutationResponse_1 = require("../IMutationResponse");
let RoomData = class RoomData {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", String)
], RoomData.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RoomData.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => message_model_1.IMessage),
    __metadata("design:type", message_model_1.IMessage)
], RoomData.prototype, "maxMessage", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => [user_model_1.IUser]),
    __metadata("design:type", Array)
], RoomData.prototype, "participants", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => subscription_model_1.ISubscription),
    __metadata("design:type", subscription_model_1.ISubscription)
], RoomData.prototype, "status", void 0);
RoomData = __decorate([
    (0, type_graphql_1.ObjectType)()
], RoomData);
let GetRoomsResponse = exports.GetRoomsResponse = class GetRoomsResponse {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => [RoomData], { nullable: true }),
    __metadata("design:type", Array)
], GetRoomsResponse.prototype, "data", void 0);
exports.GetRoomsResponse = GetRoomsResponse = __decorate([
    (0, type_graphql_1.ObjectType)({ implements: IMutationResponse_1.IMutationResponse })
], GetRoomsResponse);
//# sourceMappingURL=GetRoomResponse.js.map