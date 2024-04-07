"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetingResolver = void 0;
const User_1 = __importDefault(require("../models/user/User"));
const language_json_1 = __importDefault(
  require("../../public/language/language.json")
);
const auth_1 = require("../middleware/auth");
const type_graphql_1 = require("type-graphql");
let GreetingResolver = (exports.GreetingResolver = class GreetingResolver {
  async hello(context) {
    var _a;
    const id = context.user.id;
    const data = await User_1.default.findOne({
      _id: id,
    });
    if (!data) {
      return `data not found`;
    }
    return `hello ${
      (_a = data.userName) !== null && _a !== void 0 ? _a : "world"
    }`;
  }
  async getLang(langType) {
    // console.log(langType);
    let getLang;
    switch (langType) {
      case "en":
        getLang = language_json_1.default["en"];
        break;
      case "vi":
        getLang = language_json_1.default["vi"];
        break;
      default:
        getLang = language_json_1.default;
        break;
    }
    return JSON.stringify(getLang);
  }
});
__decorate(
  [
    (0, type_graphql_1.Query)((_return) => String),
    (0, type_graphql_1.UseMiddleware)(auth_1.Auth.verifyToken),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise),
  ],
  GreetingResolver.prototype,
  "hello",
  null
);
__decorate(
  [
    (0, type_graphql_1.Mutation)((_return) => String),
    __param(0, (0, type_graphql_1.Arg)("langType")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise),
  ],
  GreetingResolver.prototype,
  "getLang",
  null
);
exports.GreetingResolver = GreetingResolver = __decorate(
  [(0, type_graphql_1.Resolver)()],
  GreetingResolver
);
//# sourceMappingURL=greeting.resolver.js.map
