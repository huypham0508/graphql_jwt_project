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
exports.RelationshipResolver = void 0;
const type_graphql_1 = require("type-graphql");
const friend_enum_1 = require("../../core/enum/friend.enum");
const auth_1 = require("../../core/middleware/auth");
const friend_model_1 = require("../../core/models/friend/friend.model");
const user_model_1 = __importDefault(require("../../core/models/user/user.model"));
const FindFriendsResponse_1 = require("../../core/types/response/relationship/FindFriendsResponse");
const GetFriendResponse_1 = require("../../core/types/response/relationship/GetFriendResponse");
const RelationshipResponse_1 = require("../../core/types/response/relationship/RelationshipResponse");
let RelationshipResolver = exports.RelationshipResolver = class RelationshipResolver {
    async findFriendByEmail(email, { user }) {
        try {
            const friendsRequests = await user_model_1.default.find({
                email: { $regex: email, $options: "i" },
            })
                .select("-password")
                .lean();
            const areFriendPromises = await Promise.all(friendsRequests.map(async (friendUser) => {
                const areFriend = await friend_model_1.FriendModel.findOne({
                    $or: [
                        { user: user.id, friend: friendUser._id },
                        { user: friendUser._id, friend: user.id },
                    ],
                });
                const status = areFriend ? areFriend.status : "nothing";
                return status;
            }));
            const statuses = await Promise.all(areFriendPromises);
            const friendsWithStatus = friendsRequests.map((friendUser, index) => {
                var _a;
                const userResponse = new FindFriendsResponse_1.FindUserResponse();
                userResponse.id = (_a = friendUser._id) !== null && _a !== void 0 ? _a : "";
                userResponse.email = friendUser.email;
                userResponse.userName = friendUser.userName;
                userResponse.avatar = friendUser.avatar;
                userResponse.status = statuses[index].toString();
                return userResponse;
            });
            if (friendsRequests) {
                return {
                    code: 200,
                    success: true,
                    message: "get friend request successfully",
                    data: friendsWithStatus,
                };
            }
            return {
                code: 404,
                success: false,
                message: "not found",
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "Error",
            };
        }
    }
    async getFriendRequests({ user }) {
        try {
            const friendsRequests = await friend_model_1.FriendModel.find({
                friend: user.id,
                status: friend_enum_1.FriendStatus.PENDING,
            })
                .populate({
                path: "user",
                select: "-password",
                options: { lean: true },
            })
                .populate({
                path: "friend",
                select: "-password",
                options: { lean: true },
            });
            const formatFriends = friendsRequests
                .map((relationship) => {
                const idRelationShip = relationship.id;
                if (relationship.user.id === user.id) {
                    return Object.assign(Object.assign({}, relationship.friend), { id: idRelationShip });
                }
                else {
                    return Object.assign(Object.assign({}, relationship.user), { id: idRelationShip });
                }
            })
                .reverse();
            return {
                code: 200,
                success: true,
                message: "get friend request successfully",
                data: formatFriends,
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "Could not fetch friend requests",
            };
        }
    }
    async getFriendList({ user }) {
        try {
            const friendList = await friend_model_1.FriendModel.find({
                $or: [
                    { user: user.id, status: friend_enum_1.FriendStatus.ACCEPTED },
                    { friend: user.id, status: friend_enum_1.FriendStatus.ACCEPTED },
                ],
            })
                .populate("user")
                .populate("friend");
            const formatFriend = friendList
                .map((relationship) => {
                if (relationship.user.id === user.id) {
                    return relationship.friend;
                }
                else {
                    return relationship.user;
                }
            })
                .reverse();
            return {
                code: 200,
                success: true,
                message: "Get friend list successfully",
                data: formatFriend,
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "Could not fetch friend list",
            };
        }
    }
    async sendFriendRequest(friendId, { user }) {
        try {
            const friendExists = await user_model_1.default.exists({ _id: friendId });
            if (!friendExists) {
                return {
                    code: 404,
                    success: false,
                    message: "Friend not found",
                };
            }
            const existingRequest = await friend_model_1.FriendModel.findOne({
                user: user.id,
                friend: friendId,
            });
            if (existingRequest) {
                return {
                    code: 200,
                    success: true,
                    message: "Friend request already sent",
                };
            }
            const friendRequest = new friend_model_1.FriendModel({
                user: user.id,
                friend: friendId,
                status: friend_enum_1.FriendStatus.PENDING,
            });
            await friendRequest.save();
            return {
                success: true,
                code: 200,
                message: "send request successfully!",
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "send request failed",
            };
        }
    }
    async acceptFriendRequest(requestId, { user }) {
        try {
            const friendRequest = await friend_model_1.FriendModel.findById(requestId);
            if (!friendRequest) {
                return {
                    code: 404,
                    success: false,
                    message: "Friend request not found",
                };
            }
            if (friendRequest.friend.toString() !== user.id) {
                return {
                    code: 200,
                    success: false,
                    message: "Unauthorized to accept friend request",
                };
            }
            if (friendRequest.status === friend_enum_1.FriendStatus.ACCEPTED) {
                return {
                    code: 200,
                    success: true,
                    message: "Friend request already accepted",
                };
            }
            friendRequest.status = friend_enum_1.FriendStatus.ACCEPTED;
            await friendRequest.save();
            return {
                code: 200,
                success: true,
                message: "Accepted friend request successfully!",
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "Accepted friend request failed!",
            };
        }
    }
    async rejectedFriendRequest(requestId, { user }) {
        try {
            const friendRequest = await friend_model_1.FriendModel.findById(requestId);
            if (!friendRequest) {
                return {
                    code: 404,
                    success: false,
                    message: "Friend request not found",
                };
            }
            if (friendRequest.friend.toString() !== user.id) {
                return {
                    code: 200,
                    success: false,
                    message: "Unauthorized to accept friend request",
                };
            }
            if (friendRequest.status === friend_enum_1.FriendStatus.REJECTED) {
                return {
                    code: 200,
                    success: true,
                    message: "Friend request already REJECTED",
                };
            }
            await friendRequest.deleteOne();
            return {
                code: 200,
                success: true,
                message: "rejected friend request successfully",
            };
        }
        catch (error) {
            console.error(error);
            return {
                code: 400,
                success: false,
                message: "rejected friend request error",
            };
        }
    }
};
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)(() => FindFriendsResponse_1.FindFriendsResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RelationshipResolver.prototype, "findFriendByEmail", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)(() => GetFriendResponse_1.GetFriendsResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RelationshipResolver.prototype, "getFriendRequests", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Query)(() => GetFriendResponse_1.GetFriendsResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RelationshipResolver.prototype, "getFriendList", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => RelationshipResponse_1.RelationshipResponse),
    __param(0, (0, type_graphql_1.Arg)("friendId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RelationshipResolver.prototype, "sendFriendRequest", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => RelationshipResponse_1.RelationshipResponse),
    __param(0, (0, type_graphql_1.Arg)("requestId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RelationshipResolver.prototype, "acceptFriendRequest", null);
__decorate([
    (0, type_graphql_1.UseMiddleware)(auth_1.VerifyTokenAll),
    (0, type_graphql_1.Mutation)(() => RelationshipResponse_1.RelationshipResponse),
    __param(0, (0, type_graphql_1.Arg)("requestId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RelationshipResolver.prototype, "rejectedFriendRequest", null);
exports.RelationshipResolver = RelationshipResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], RelationshipResolver);
//# sourceMappingURL=relationship.resolver.js.map