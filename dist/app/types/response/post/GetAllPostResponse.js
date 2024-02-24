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
exports.GetAllPostResponse = void 0;
const type_graphql_1 = require("type-graphql");
const MutationResponse_1 = require("../MutationResponse");
const Post_1 = require("../../../models/post/Post");
let GetAllPostResponse = exports.GetAllPostResponse = class GetAllPostResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.IPost], { nullable: true }),
    __metadata("design:type", Array)
], GetAllPostResponse.prototype, "data", void 0);
exports.GetAllPostResponse = GetAllPostResponse = __decorate([
    (0, type_graphql_1.ObjectType)({ implements: MutationResponse_1.IMutationResponse })
], GetAllPostResponse);
//# sourceMappingURL=GetAllPostResponse.js.map