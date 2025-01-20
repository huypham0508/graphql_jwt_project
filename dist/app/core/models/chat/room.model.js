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
exports.getChatRoom = exports.IRoom = void 0;
const mongoose_1 = require("mongoose");
const type_graphql_1 = require("type-graphql");
const user_model_1 = require("../user/user.model");
const message_model_1 = require("./message.model");
const model_name_1 = __importDefault(require("../../../core/constants/model_name"));
let IRoom = exports.IRoom = class IRoom {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", String)
], IRoom.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], IRoom.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => message_model_1.IMessage),
    __metadata("design:type", message_model_1.IMessage)
], IRoom.prototype, "maxMessage", void 0);
__decorate([
    (0, type_graphql_1.Field)((_type) => [user_model_1.IUser]),
    __metadata("design:type", Array)
], IRoom.prototype, "participants", void 0);
exports.IRoom = IRoom = __decorate([
    (0, type_graphql_1.ObjectType)()
], IRoom);
const chatRoomSchema = new mongoose_1.Schema({
    name: { type: String, default: "" },
    maxMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: model_name_1.default.MESSAGE, require: true },
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: model_name_1.default.USER, require: true }],
});
const getChatRoom = async (participants) => {
    let room = await ChatRoomModel.findOne({ participants: { $all: participants } });
    if (!room) {
        room = new ChatRoomModel({
            maxMessage: "",
            participants,
        });
        await room.save();
    }
    return room;
};
exports.getChatRoom = getChatRoom;
const ChatRoomModel = (0, mongoose_1.model)(model_name_1.default.CHAT_ROOM, chatRoomSchema);
exports.default = ChatRoomModel;
//# sourceMappingURL=room.model.js.map