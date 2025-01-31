import connectDB from "./db/dbConnect";
import app from "./app";
import logger from "./utils/logger";
import Bun from "bun";
import aj from "./utils/arcjet";

const startServer = async () => {
	try {
		await connectDB();
		const server = Bun.serve({
			port: import.meta.env.PORT || 3000,
			fetch: aj.handler(app.fetch),
		});

		logger.info(`Server running on port ${server.port}`);
		return server;
	} catch (error) {
		logger.error("Error starting server");
		if (error instanceof Error) {
			logger.error(`Error: ${error.message}`);
		} else {
			logger.error(`Error: ${error}`);
		}
	}
};

startServer();
