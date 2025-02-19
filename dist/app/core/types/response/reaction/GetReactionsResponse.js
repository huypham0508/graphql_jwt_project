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
exports.GetReactionsResponse = void 0;
const type_graphql_1 = require("type-graphql");
const IMutationResponse_1 = require("../IMutationResponse");
const reaction_model_ts_1 = require("../../../models/reaction/reaction.model.ts");
let GetReactionsResponse = exports.GetReactionsResponse = class GetReactionsResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [reaction_model_ts_1.IReaction], { nullable: true }),
    __metadata("design:type", Array)
], GetReactionsResponse.prototype, "data", void 0);
exports.GetReactionsResponse = GetReactionsResponse = __decorate([
    (0, type_graphql_1.ObjectType)({ implements: IMutationResponse_1.IMutationResponse })
], GetReactionsResponse);
//# sourceMappingURL=GetReactionsResponse.js.map