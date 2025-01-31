import { Hono } from "hono";
import {
	deleteVideo,
	getAllVideos,
	getVideoById,
	publishVideo,
	togglePublishStatus,
	updateVideo,
} from "../controllers/video.controller";
import verifyJWT from "../middlewares/verifyJWT";
import type { AppEnv } from "../constants";
import {
	deleteVideoValidator,
	getVideoValidator,
	togglePublishStatusValidator,
	updateVideoFormValidator,
	updateVideoParamValidator,
	uploadVideoValidator,
} from "../middlewares/validators/video.validator";

const videoRouter = new Hono<AppEnv>();
videoRouter.use(verifyJWT);

videoRouter
	.get("/", getAllVideos)
	.post("/", uploadVideoValidator, publishVideo);

videoRouter
	.basePath("/:videoId")
	.get(getVideoValidator, getVideoById)
	.delete(deleteVideoValidator, deleteVideo)
	.patch(updateVideoFormValidator, updateVideoParamValidator, updateVideo);

videoRouter.patch(
	"toggle/publish/:videoId",
	togglePublishStatusValidator,
	togglePublishStatus
);

export default videoRouter;
