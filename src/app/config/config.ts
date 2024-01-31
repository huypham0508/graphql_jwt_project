import dotenv from "dotenv";
dotenv.config();

export class ConfigMongo {
  public static URI_DATABASE: any = process.env.CONNECT_MONGO_DB;
}
export class ConfigServer {
  public static PORT: any = process.env.PORT || 4000;
}
export class ConfigJWT {
  public static create_token_type: string = "createToken";
  public static refresh_token_type: string = "refreshToken";
  public static JWT_ACCESS_PRIVATE_KEY: any =
    process.env.JWT_ACCESS_PRIVATE_KEY;
  public static JWT_REFRESH_PRIVATE_KEY: any =
    process.env.JWT_REFRESH_PRIVATE_KEY;
  public static REFRESH_TOKEN_COOKIE_NAME: any =
    process.env.REFRESH_TOKEN_COOKI_NAME;
}
export class ConfigBcrypt {
  public static saltRounds = 10;
}
