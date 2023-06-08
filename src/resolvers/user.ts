import User,
{
    // IUser
} from "../models/User";
import { RegisterInput } from "../types/RegisterInput";
import { Arg, Mutation, Resolver } from "type-graphql";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { LoginInput } from "../types/LoginInput";
import { Bcrypt } from "../bcrypt/index";
import { Auth } from "../utils/auth";


@Resolver()
export class UserResolver {
    @Mutation(_return => UserMutationResponse)
    async register(
        @Arg('registerInput')
        registerInput: RegisterInput):
        Promise<UserMutationResponse> {
        const { email, userName, password } = registerInput;
        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            return {
                code: 400,
                success: false,
                message: "Email already exists!!!",
            };
        }
        const hashedPassword = await Bcrypt.hashPassword(password);
        const newUser = new User({
            email,
            userName,
            password: hashedPassword,
        });
        await newUser.save();
        return {
            code: 200,
            success: true,
            message: "User registered successfully!!!",
        }
    }
    @Mutation(_return => UserMutationResponse)
    async login(@Arg('loginInput')
    { email, password }: LoginInput): Promise<UserMutationResponse> {
        let hashPassword = "";
        const checkAccount = await User.findOne({
            email
        });
        //check email
        if (!checkAccount) {
            return {
                code: 400,
                success: false,
                message: "Emaill error!!!",
            }
        }
        //check password
        hashPassword = await checkAccount.password;
        const checkPassword = await Bcrypt.comparePassword(password, hashPassword);
        if (!checkPassword) {
            return {
                code: 400,
                success: false,
                message: "Password error!!!",
            }
        }
        return {
            code: 200,
            success: true,
            message: "Logged in successfully!!!",
            accessToken: Auth.createToken({
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: checkAccount.password,
            }),
            user: {
                id: checkAccount._id,
                email: checkAccount.email,
                userName: checkAccount.userName,
                password: checkAccount.password,
            },
        }
    }

}