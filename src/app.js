import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import ApiError from "./utils/ApiError.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        cridentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use((err, req, res, next) => {
    // Use the provided error if it's an instance of ApiError, otherwise create a generic ApiError
    const error =
        err instanceof ApiError
            ? err
            : new ApiError(
                  err.status || 500,
                  err.message || "Internal Server Error",
                  [],
                  process.env.NODE_ENV === "development" ? err.stack : undefined
              );
    console.log(err.stack);

    return res.status(error.statusCode).json({
        success: error.success,
        status: error.statusCode,
        message: error.message,
        errors: error.errors,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
});

export { app };
