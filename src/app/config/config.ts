import dotenv from "dotenv";
dotenv.config();

export class ConfigMongo {
  public static URI_DATABASE: any =
    "mongodb+srv://admin2:oORArVKaZaSxgjfb@cluster0.37vmswz.mongodb.net/?retryWrites=true&w=majority";
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
