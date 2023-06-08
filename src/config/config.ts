import dotenv from "dotenv";
dotenv.config();


export class ConfigMongo {
    public static URI_DATABASE: any = process.env.CONNECT_MONGO_DB;
}
export class ConfigServer {
    public static PORT: any = process.env.PORT || 4000;
}
export class ConfigJWT {
    public static JWT_ACCESS_PRIVATE_KEY: any = process.env.JWT_ACCESS_PRIVATE_KEY;
    public static JWT_REFRESH_PRIVATE_KEY: any = process.env.JWT_REFRESH_PRIVATE_KEY;
}
export class ConfigBcrypt {
    public static saltRounds = 10
}