"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatResolver = void 0;
const type_graphql_1 = require("type-graphql");
const events_controller_1 = require("../controllers/events.controller");
const auth_1 = require("../../core/middleware/auth");
const message_model_1 = require("../../core/models/chat/message.model");
const room_model_1 = __importStar(require("../../core/models/chat/room.model"));
const subscription_model_1 = __importStar(require("../../core/models/chat/subscription.model"));
const MessageInput_1 = require("../../core/types/input/chat/MessageInput");
const NewMessageInput_1 = require("../../core/types/input/chat/NewMessageInput");
const GetRoomResponse_1 = require("../../core/types/response/chat/GetRoomResponse");
const MessageResponse_1 = require("../../core/types/response/chat/MessageResponse");
const SendNewMessageResponse_1 = require("../../core/types/response/chat/SendNewMessageResponse");
const IMutationResponse_1 = require("../../core/types/response/IMutationResponse");
let ChatResolver = exports.ChatResolver = class ChatResolver {
    async sendNewMessage(messageInput, { req, user }) {
        try {
            const { content, recipientId } = messageInput;
            if (recipientId === null) {
                return {
                    success: false,
                    code: 404,
                    message: req.t("Recipient not found!"),
                };
            }
            const participants = [recipientId, user.id];
            let room = await (0, room_model_1.getChatRoom)(participants);
            const maxMessage = new message_model_1.MessageModel({
                sender: user.id,
                content,
                room: room._id.toString(),
            });
            await maxMessage.save();
            room.maxMessage = maxMessage;
            await room.save();
            await (await room.populate({
                path: "maxMessage",
                populate: {
                    path: "sender",
                    populate: {
                        path: "role",
                    }
                },
            })).populate({
                path: "participants",
                populate: {
                    path: "role",
                }
            });
            (0, events_controller_1.doEvents)({
                eventData: {
                    type: "message",
                    op: "add",
                    event: maxMessage,
                    recipients: [recipientId],
                },
            });
            (0, subscription_model_1.createSubscriptions)({
                messageId: maxMessage.id,
                recipientIds: participants,
                roomId: room.id,
                senderId: user.id,
            });
            return {
                success: true,
                code: 200,
                room: room,
                message: req.t("Message sent successfully!"),
            };
        }
        catch (error) {
            return {
                success: false,
                code: 404,
                message: req.t("Failed to send message"),
            };
        }
    }
    async sendMessage(messageInput, { req, user }) {
        try {
            const { content, roomId } = messageInput;
            const findRoom = await room_model_1.default.findById(roomId);
            if (findRoom === null) {
                return {
                    success: false,
                    code: 404,
                    message: req.t("Room does not exist!"),
                };
            }
            const maxMessage = new message_model_1.MessageModel({
                sender: user.id,
                content,
                room: roomId,
            });
            findRoom.maxMessage = maxMessage;
            await Promise.all([findRoom.save(), maxMessage.save()]);
            const recipients = findRoom.participants.map((id) => id.toString());
            (0, events_controller_1.doEvents)({
                eventData: {
                    type: "message",
                    op: "add",
                    event: maxMessage,
                    recipients: recipients.filter((participant) => participant !== user.id),
                },
            });
            (0, subscription_model_1.createSubscriptions)({
                messageId: maxMessage.id,
                recipientIds: recipients,
                roomId: findRoom.id,
                senderId: user.id,
            });
            return {
                success: true,
                code: 200,
                message: req.t("Message sent successfully!"),
            };
        }
        catch (error) {
            return {
                success: false,
                code: 404,
                message: req.t("Failed to send message"),
            };
        }
    }
    async getMessagesByRoomId(roomId, { req, user }) {
        try {
            const messages = await message_model_1.MessageModel.find({
                room: roomId,
            }).sort({ timestamp: 1 })
                .populate({ path: "room", populate: { path: "participants" } })
                .populate({ path: "sender", populate: { path: "role" } });
            const subscriptions = await subscription_model_1.default.find({
                room: roomId,
                user: user.id,
            }).populate("user").populate("message");
            const messageData = messages.map((message) => {
                const status = subscriptions.find((sub) => sub.message.id.toString() === message.id.toString());
                return {
                    message: message,
                    status: status,
                };
            });
            return {
                success: true,
                code: 200,
                message: req.t("Successfully!"),
                data: messageData,
            };
        }
        catch (error) {
            throw new Error(req.t("Failed to fetch messages"));
        }
    }
    async getAllRooms({ req, user }) {
        try {
            const rooms = await room_model_1.default.find({
                participants: user.id,
            })
                .populate({ path: "participants", populate: { path: "role" } })
                .populate({ path: "maxMessage", populate: { path: "sender" } });
            const subscriptions = await subscription_model_1.default.find({
                user: user.id,
            }).populate("user").populate("message");
            const filteredRooms = rooms.map((room) => {
                var _a;
                let name = "";
                const filteredParticipants = room.participants.filter((participant, index) => {
                    if (room.name === null || room.name === "") {
                        if (room.participants.length > 2) {
                            if (index > 0) {
                                name += ", ";
                            }
                            name += participant.userName;
                        }
                    }
                    return participant.id.toString() !== user.id;
                });
                if (room.participants.length == 2) {
                    name = (_a = filteredParticipants[0].userName) !== null && _a !== void 0 ? _a : "";
                }
                return {
                    id: room._id.toString(),
                    name: name,
                    participants: filteredParticipants,
                    maxMessage: room.maxMessage,
                    status: subscriptions.find((s) => s.message.id.toString() === room.maxMessage.id.toString())
                };
            });
            return {
                code: 200,
                success: true,
                data: filteredRooms,
            };
        }
        catch (error) {
            throw new Error(req.t("Failed to fetch rooms"));
        }
    }
    async createRoom(participantIds, roomName, { req, user }) {
        try {
            if (participantIds.length < 1) {
                return {
                    success: false,
                    code: 404,
                    message: req.t("Recipients is required!"),
                };
            }
            const newRoom = new room_model_1.default({
                name: roomName,
                maxMessage: "",
                participants: [...participantIds, user.id],
            });
            const maxMessage = new message_model_1.MessageModel({
                sender: user.id,
                content: req.t("{{userName}} has been created successfully", { "userName": user.userName }),
                room: newRoom._id.toString(),
            });
            newRoom.maxMessage = maxMessage;
            newRoom.populate("maxMessage");
            await Promise.all([maxMessage.save(), newRoom.save()]);
            const recipients = [...participantIds, user.id];
            (0, events_controller_1.doEvents)({
                eventData: {
                    type: "room",
                    op: "add",
                    event: newRoom,
                    recipients: recipients.filter((participant) => participant !== user.id),
                },
            });
            (0, subscription_model_1.createSubscriptions)({
                messageId: maxMessage.id,
                recipientIds: recipients,
                roomId: newRoom.id,
                senderId: user.id,
            });
            return {
                success: true,
                code: 200,
                message: req.t("Room created successfully {{name}}", { name: roomName }),
            };
        }
        catch (error) {
            throw new Error("Failed to create room");
        }
    }
};
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => SendNewMessageResponse_1.SendNewMessageResponse),
    __param(0, (0, type_graphql_1.Arg)("newMessageInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NewMessageInput_1.NewMessageInput, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "sendNewMessage", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => IMutationResponse_1.ResponseData),
    __param(0, (0, type_graphql_1.Arg)("messageInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MessageInput_1.MessageInput, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "sendMessage", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)(() => MessageResponse_1.MessageResponse),
    __param(0, (0, type_graphql_1.Arg)("roomId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getMessagesByRoomId", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)(() => GetRoomResponse_1.GetRoomsResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getAllRooms", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => IMutationResponse_1.ResponseData),
    __param(0, (0, type_graphql_1.Arg)("participantIds", () => [String])),
    __param(1, (0, type_graphql_1.Arg)("roomName")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "createRoom", null);
exports.ChatResolver = ChatResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], ChatResolver);
//# sourceMappingURL=chat.resolver.js.map