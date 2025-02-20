import { HydratedDocument } from "mongoose";
import UserModel, { IUser } from "../../../core/models/user/user.model";

const addUser = async ({
  email,
  userName,
  password,
  avatar,
  role,
}: {
  email: string;
  userName: string;
  password: string;
  avatar?: string;
  role: any;
}): Promise<HydratedDocument<IUser>> => {
  try {
    const user = new UserModel({ email, userName, password, avatar, role });
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`addUser - error: ${error}`);
  }
};

const getOneUser = async (
  data: Partial<IUser>
): Promise<HydratedDocument<IUser> | null> => {
  try {
    return await UserModel.findOne(data).lean();
  } catch (error) {
    throw new Error(`getOneUser - error: ${error}`);
  }
};

const updateOneUser = async (
  filter: { _id?: string; email?: string },
  updateData: Partial<IUser>
): Promise<boolean> => {
  try {
    const result = await UserModel.updateOne(filter, updateData);

    return result.modifiedCount > 0;
  } catch (error) {
    throw new Error(`updateOneUser - error: ${error}`);
  }
};

export { addUser, getOneUser, updateOneUser };
