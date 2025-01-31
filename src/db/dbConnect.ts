import mongoose from "mongoose";
import { DB_NAME } from "../constants";
import logger from "../utils/logger";
import process from "node:process";

const connectDB = async () => {
	try {
		const connectionInstance = await mongoose.connect(
			`${import.meta.env.MONGODB_URI}/${DB_NAME}`
		);
		logger.info(
			`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
		);
	} catch (error) {
		logger.error("Error connecting to MongoDB");
		if (error instanceof Error) {
			logger.error(`Error: ${error.message}`);
		} else {
			logger.error(`Error: ${error}`);
		}
		process.exit(1);
	}
};

export default connectDB;
