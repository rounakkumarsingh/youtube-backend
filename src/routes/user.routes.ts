import { Hono } from "hono";
import {
	changeCurrentPassword,
	getUserChannelProfile,
	getWatchHistory,
	loginUser,
	logoutUser,
	regitserUser,
	startEmailVerification,
	updateAccountDetails,
	updateCoverImage,
	updateUserAvatar,
	verifyEmail,
} from "../controllers/user.controller";
import verifyJWT from "../middlewares/verifyJWT";
import {
	channelProfileValidator,
	coverImageUpdateValidator,
	loginValidator,
	registerValidator,
	updateAccountValidator,
	verifyEmailValidator,
} from "../middlewares/validators/user.validators";

const userRouter = new Hono()
	.basePath("/users")
	.post("/register", registerValidator, regitserUser)
	.post("/login", loginValidator, loginUser)
	// secured routes
	.post("/logout", ...verifyJWT, logoutUser)
	.post("/change-password", ...verifyJWT, changeCurrentPassword)
	.patch(
		"/update-account",
		...verifyJWT,
		updateAccountValidator,
		updateAccountDetails
	)
	.patch(
		"/update-avatar",
		...verifyJWT,
		updateAccountValidator,
		updateUserAvatar
	)
	.patch(
		"/update-cover-image",
		...verifyJWT,
		coverImageUpdateValidator,
		updateCoverImage
	)
	.get(
		"/channel/:username",
		...verifyJWT,
		channelProfileValidator,
		getUserChannelProfile
	)
	.get("/watch-history", ...verifyJWT, getWatchHistory)
	.post("/verify-email", ...verifyJWT, startEmailVerification)
	.get("/verify-email/:token", verifyEmailValidator, verifyEmail);

export default userRouter;
