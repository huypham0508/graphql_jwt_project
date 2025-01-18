import bcrypt from "bcrypt";
import { ConfigBcrypt } from "../constants/config";

export class Bcrypt {
    public static hashPassword(plaintextPassword: string) {
        return bcrypt.hash(plaintextPassword, ConfigBcrypt.saltRounds);
    }

    // compare password
    public static comparePassword(plaintextPassword: string, hash: string) {
        return bcrypt.compare(plaintextPassword, hash);
    }
}