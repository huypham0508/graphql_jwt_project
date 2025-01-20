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
exports.createSubscriptions = exports.ISubscription = void 0;
const mongoose_1 = require("mongoose");
const type_graphql_1 = require("type-graphql");
const model_name_1 = __importDefault(require("../../../core/constants/model_name"));
const user_model_1 = require("../user/user.model");
const status_message_enum_1 = require("../../../core/enum/status_message.enum");
let ISubscription = exports.ISubscription = class ISubscription {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", String)
], ISubscription.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => user_model_1.IUser),
    __metadata("design:type", user_model_1.IUser)
], ISubscription.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Date)
], ISubscription.prototype, "updatedAt", void 0);
exports.ISubscription = ISubscription = __decorate([
    (0, type_graphql_1.ObjectType)()
], ISubscription);
const subscriptionSchema = new mongoose_1.Schema({
    status: {
        type: String,
        required: true,
        enum: [
            status_message_enum_1.StatusMessage.SENT,
            status_message_enum_1.StatusMessage.DELIVERED,
            status_message_enum_1.StatusMessage.SEEN,
            status_message_enum_1.StatusMessage.ERROR,
        ],
    },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: model_name_1.default.USER, required: true },
    message: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: model_name_1.default.MESSAGE,
        required: true,
    },
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: model_name_1.default.CHAT_ROOM,
        required: true,
    },
}, {
    timestamps: { createdAt: false, updatedAt: true },
});
const SubscriptionModel = (0, mongoose_1.model)(model_name_1.default.SUBSCRIPTION, subscriptionSchema);
const createSubscriptions = async (params) => {
    const { messageId, roomId, senderId, recipientIds } = params;
    try {
        const users = [...recipientIds, senderId];
        const subscriptions = users.map((userId) => ({
            user: userId,
            message: messageId,
            room: roomId,
            status: userId === senderId ? status_message_enum_1.StatusMessage.SENT : status_message_enum_1.StatusMessage.DELIVERED,
        }));
        await SubscriptionModel.insertMany(subscriptions);
        console.log("Subscriptions created successfully:", subscriptions);
    }
    catch (error) {
        console.error("Error creating subscriptions:", error);
    }
};
exports.createSubscriptions = createSubscriptions;
exports.default = SubscriptionModel;
//# sourceMappingURL=subscription.model.js.map