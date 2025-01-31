import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import type { AppEnv } from "./constants";
import commentRouter from "./routes/comment.routes";
import userRouter from "./routes/user.routes";
import videoRouter from "./routes/video.routes";
import ApiError from "./utils/ApiError";

const app = new Hono<AppEnv>().basePath("/v1");

app.use(logger());

// using routes
app.route("/users", userRouter);
app.route("/videos", videoRouter);
app.route("/comments", commentRouter);

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
