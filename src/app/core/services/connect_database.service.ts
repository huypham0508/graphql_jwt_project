import dotenv from "dotenv";
import mongoose from "mongoose";
import { ConfigMongo } from "../../config";

dotenv.config();
const connectDBService: any = async () => {
  try {

    await mongoose.connect(ConfigMongo.URI_DATABASE, {
      // useCreatendex: true,
      // useFindAndModify: false,
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.clear();
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
export default connectDBService;
