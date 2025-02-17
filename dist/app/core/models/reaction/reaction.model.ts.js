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
exports.reactionSchema = exports.IReaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const model_name_1 = __importDefault(require("../../../core/constants/model_name"));
const type_graphql_1 = require("type-graphql");
const Schema = mongoose_1.default.Schema;
const model = mongoose_1.default.model;
let IReaction = exports.IReaction = class IReaction {
};
__decorate([
    (0, type_graphql_1.Field)((_type) => type_graphql_1.ID),
    __metadata("design:type", Object)
], IReaction.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], IReaction.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], IReaction.prototype, "count", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], IReaction.prototype, "imageURL", void 0);
exports.IReaction = IReaction = __decorate([
    (0, type_graphql_1.ObjectType)()
], IReaction);
exports.reactionSchema = new Schema({
    name: String,
    count: { type: Number, default: 0 },
    imageURL: String,
});
const ReactionModel = model(model_name_1.default.REACTION, exports.reactionSchema);
exports.default = ReactionModel;
//# sourceMappingURL=reaction.model.ts.js.map