import { Hono } from "hono";
import userRouter from "./routes/user.routes";
import ApiError from "./utils/ApiError";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import videoRouter from "./routes/video.routes";
import { type AppEnv } from "./constants";

const app = new Hono<AppEnv>().basePath("/v1");

app.use(logger());

// using routes
app.route("/", userRouter);
app.route("/", videoRouter);

app.onError((error, c) => {
	console.error(error);
	if (error instanceof ApiError) {
		c.status(error.statusCode);
		return c.json({
			success: error.success,
			message: error.message,
			errors: error.errors,
			data: error.data,
		});
	} else {
		c.status(500);
		return c.json({
			success: false,
			message: "Internal Server Error",
			errors: [],
			data: null,
		});
	}
});

showRoutes(app, {
	verbose: true,
});

export default app;
