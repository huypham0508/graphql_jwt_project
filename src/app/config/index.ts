import express from "express";
import dotenv from "dotenv";
import { RedisClientOptions } from "redis";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export class ConfigMongo {
  private static URI_PRO: string = process.env.DB_URI_PRODUCTION ?? "";
  private static URI_DEV: string = process.env.DB_URI_DEV ?? "";
  public static URI_DATABASE: any = isProduction ? this.URI_PRO : this.URI_DEV;
}

export class ConfigServer {
  public static app = express();
  public static PORT: any = process.env.PORT || 4000;
  // rate limited settings
  public static WINDOW_MS: number = 15 * 60 * 1000;
  public static MAX_REQUESTS: number = 75;
  public static DEFAULT_ROLE: string = "member";
}
export class ConfigJWT {
  public static create_token_type: string = "createToken";
  public static refresh_token_type: string = "refreshToken";
  public static JWT_ACCESS_PRIVATE_KEY: any = process.env.JWT_ACCESS_PRIVATE_KEY;
  public static JWT_REFRESH_PRIVATE_KEY: any = process.env.JWT_REFRESH_PRIVATE_KEY;
  public static REFRESH_TOKEN_COOKIE_NAME: any = process.env.REFRESH_TOKEN_COOKI_NAME;
}

export class Role {
  public static ALL: string = "ALL";
  public static FORGOT_PASSWORD: string = "FORGOT_PASSWORD";
}
export class ConfigBcrypt {
  public static saltRounds = 10;
}

export class Otp {
  public static ACCESS_TOKEN = process.env.ACCESS_TOKEN_OAUTH;
  public static REFRESH_TOKEN = process.env.REFRESH_TOKEN_OAUTH;
  public static CLIENT_ID = process.env.CLIENT_ID;
  public static CLIENT_SECRET = process.env.CLIENT_SECRET;
  public static REDIRECT_URI = "https://developers.google.com/oauthplayground";
  public static MY_EMAIL = process.env.MY_EMAIL;
  public static EXPIRATION_TIME = 2 * 60 * 1000;
}

export class Redis {
  public static SAVE_TIME = 1800;

  //connection configuration
  public static STATUS_REDIS_CONNECT = {
    "CONNECT": "connect",
    "END": "end",
    "RE_CONNECT": "reconnect",
    "ERROR": "error",
  };
  public static REDIS_CONNECT_TIMEOUT = 30000;
  public static OPTIONS_PRO: RedisClientOptions = {
    username: process.env.REDIS_CLOUD_USERNAME,
    password: process.env.REDIS_CLOUD_PASSWORD,
    socket: {
        host: process.env.REDIS_CLOUD_HOST,
        port: Number(process.env.REDIS_CLOUD_PORT ?? "0"),
    }
  };

  public static OPTIONS_DEV: RedisClientOptions = {
    socket: {
      host: 'localhost',
      port: 6379,
    }
  };

  public static REDIS_OPTIONS: RedisClientOptions = isProduction ? this.OPTIONS_PRO : this.OPTIONS_DEV;
}