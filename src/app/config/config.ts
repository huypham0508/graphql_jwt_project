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
export class ConfigBcrypt {
  public static saltRounds = 10;
}

export class Otp {
  public static ACCESS_TOKEN =
    "ya29.a0AfB_byDFbyfxq8dJplv1CDcjcTq2aySNgEMwkbU_y01qLjBnzzH8VVS8StVRdDHPEDj96ZoojYVqw2Bf5CVgjxFnmxWPmpltJY0BxpUJLmnQadoEynkbolVhUbkTGwTVhM6Ccrm7fXL-3m1Fo13eT2jOUmpgqvNtthhTaCgYKAU0SARASFQHGX2Migi_fIL4hp7-A1XF3TunYlQ0171";
  public static REFRESH_TOKEN =
    "1//04AgIJmadjdoUCgYIARAAGAQSNwF-L9Ir7EXxbG76ld_98odkq73nvpp8fMxRbGER5ntQGiEQWn4l3XHHHBLD3h1h7_i-6SY4HY4";
  public static CLIENT_ID =
    "448160075675-bj8rn65b967s1t78bshbkg35jj5jiaf7.apps.googleusercontent.com";
  public static CLIENT_SECRET = "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";
  public static REDIRECT_URI = "https://developers.google.com/oauthplayground";
  public static MY_EMAIL = "phammanhhuy1107@gmail.com";
  public static EXPIRATION_TIME = 2 * 60 * 1000;
}
