import { createMiddleware } from "hono/factory";
import logger from "../utils/logger";

const loggerMiddleware = createMiddleware(async (c, next) => {
	const start = Date.now();
	const method = c.req.url;
	await next();

	const responseTime = Date.now() - start;

	const path = c.req.path;

	const status = c.res.status;

	const logObject = {
		method,
		path,
		status,
		responseTime: `${responseTime}ms`,
	};

	logger.info(logObject);
});

export default loggerMiddleware;
