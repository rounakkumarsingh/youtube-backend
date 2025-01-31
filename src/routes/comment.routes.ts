import { Hono } from "hono";
import type { AppEnv } from "../constants";
import verifyJWT from "../middlewares/verifyJWT";
import {
	getCommentComments,
	getTweetComments,
	getVideoComments,
} from "../controllers/comment.controller";

const commentRouter = new Hono<AppEnv>().basePath("/comments");

commentRouter.use(verifyJWT);

commentRouter.basePath("/video/:videoId").get(getVideoComments);
commentRouter.basePath("/comment/:commentId").get(getCommentComments);
commentRouter.basePath("/tweet/:tweetId").get(getTweetComments);

commentRouter.basePath("/comment/:commentId/manage").get();
export default commentRouter;
