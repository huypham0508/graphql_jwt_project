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
exports.MessageResponse = void 0;
const subscription_model_1 = require("../../../models/chat/subscription.model");
const type_graphql_1 = require("type-graphql");
const IMutationResponse_1 = require("../IMutationResponse");
const message_model_1 = require("../../../models/chat/message.model");
let MessageData = class MessageData {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => subscription_model_1.ISubscription),
    __metadata("design:type", subscription_model_1.ISubscription)
], MessageData.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => message_model_1.IMessage),
    __metadata("design:type", message_model_1.IMessage)
], MessageData.prototype, "message", void 0);
MessageData = __decorate([
    (0, type_graphql_1.ObjectType)()
], MessageData);
let MessageResponse = exports.MessageResponse = class MessageResponse {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => [MessageData], { nullable: true }),
    __metadata("design:type", Array)
], MessageResponse.prototype, "data", void 0);
exports.MessageResponse = MessageResponse = __decorate([
    (0, type_graphql_1.ObjectType)({ implements: IMutationResponse_1.IMutationResponse })
], MessageResponse);
//# sourceMappingURL=MessageResponse.js.map