import { createMiddleware } from "hono/factory";
import {
	type RegisterInput,
	type LoginInput,
	type PasswordChangeInput,
	type UpdateUserInput,
	type AvatarUpdateInput,
	type CoverImageUpdateInput,
	type ChannelProfileInput,
	type VerifyEmailInput,
} from "../schemas/user.schema";
import { signUpProtection } from "../utils/arcjet";
import ApiError from "../utils/ApiError";
import User, { type UserDocument } from "../models/user.model";
import Bun from "bun";
import { uploadOnCloudinary } from "../utils/cloudinary";
import logger from "../utils/logger";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cookieOptions, type AppEnv } from "../constants";
import { verify } from "hono/jwt";
import emailVerificationLink from "../utils/emailVerify";

const generateAccessAndRefreshToken = async (
	user: InstanceType<typeof User>
) => {
	try {
		const accessToken = await user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();

		user.refreshToken = refreshToken;

		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		logger.error(error);
		throw new ApiError(
			500,
			"Something went wrong while generating refresh and access token"
		);
	}
};

const regitserUser = createMiddleware<AppEnv>(async (c) => {
	const form: RegisterInput = c.req.valid("form");

	const { email, fullName, username, password, avatar, coverImage } = form;

	const decision = await signUpProtection.protect(c.req.raw, {
		email,
	});

	if (decision.isDenied() || decision.isChallenged()) {
		if (decision.reason.isEmail()) {
			throw new ApiError(422, "Invalid email address");
		} else if (decision.reason.isRateLimit()) {
			throw new ApiError(429, "Too many requests, try again later");
		}
	} else if (decision.conclusion === "ERROR") {
		throw new ApiError(500, "Internal server error");
	}

	const existedUser = await User.findOne({
		$or: [{ email: form.email }, { username: form.username }],
	});
	if (existedUser) {
		throw new ApiError(400, "User already exists");
	}

	await Bun.write("public/temp/" + avatar.name, avatar);

	if (coverImage) {
		await Bun.write("public/temp/" + coverImage.name, coverImage);
	}

	const avatarLink = (await uploadOnCloudinary("public/temp/" + avatar.name))
		.url;
	let coverImageLink = "";
	if (coverImage) {
		coverImageLink = (
			await uploadOnCloudinary("public/temp/" + coverImage.name)
		).url;
	}

	const user = await User.create({
		fullName,
		avatar: avatarLink,
		coverImage: coverImageLink,
		email,
		password,
		username: username.toLowerCase(),
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	if (!createdUser) {
		throw new ApiError(
			500,
			"Something went wrong while registering the user"
		);
	}

	return c.json({ user: createdUser }, 200);
});

const loginUser = createMiddleware<AppEnv>(async (c) => {
	const form: LoginInput = c.req.valid("form");

	const { username, password, email } = form;

	const user = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	const isPasswordValid = await user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid credentials");
	}

	const { accessToken, refreshToken } =
		await generateAccessAndRefreshToken(user);

	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	setCookie(c, "refreshToken", refreshToken, cookieOptions);
	setCookie(c, "accessToken", accessToken, cookieOptions);

	return c.json({ user: loggedInUser, accessToken, refreshToken }, 200);
});

const logoutUser = createMiddleware<AppEnv>(async (c) => {
	const userId = c.var.user._id;

	await User.findByIdAndUpdate(
		userId,
		{
			$unset: {
				refreshToken: 1,
			},
		},
		{ new: true }
	);

	deleteCookie(c, "accessToken", cookieOptions);
	deleteCookie(c, "refreshToken", cookieOptions);
	return c.json({ message: "User Logged Out Succesfully" }, 200);
});

const refreshAccessToken = createMiddleware(async (c) => {
	const incomingRefreshToken = getCookie(c, "refreshToken");

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request");
	}

	try {
		const decodedToken = await verify(
			incomingRefreshToken,
			import.meta.env.REFRESH_TOKEN_SECRET as string
		);

		const user = await User.findById(decodedToken?._id);

		if (!user) {
			throw new ApiError(401, "Invalid refresh Token");
		}

		if (incomingRefreshToken !== user?.refreshToken) {
			throw new ApiError(401, "refresh Token is expired or wrong");
		}

		const { accessToken, refreshToken: newRefreshToken } =
			await generateAccessAndRefreshToken(user);

		setCookie(c, "accessToken", accessToken, cookieOptions);
		setCookie(c, "refreshToken", newRefreshToken, cookieOptions);

		return c.json({ accessToken, refreshToken: newRefreshToken }, 200);
	} catch (error) {
		throw new ApiError(
			401,
			(error as Error)?.message || "Invalid Refresh Token"
		);
	}
});

const changeCurrentPassword = createMiddleware<AppEnv>(async (c) => {
	const { oldPassword, newPassword }: PasswordChangeInput =
		c.req.valid("form");

	const user = c.get("user");

	const isPasswordCorrect =
		user && (await user.isPasswordCorrect(oldPassword));

	if (!isPasswordCorrect) {
		throw new ApiError(400, "Invalid old password");
	}

	user.password = newPassword;
	await user.save({ validateBeforeSave: false });

	return c.json({ success: true }, 200);
});

const getCurrentUser = createMiddleware<AppEnv>(async (c) => {
	return c.json({ user: c.get("user") }, 200);
});

const updateAccountDetails = createMiddleware<AppEnv>(async (c) => {
	const { fullName, email }: UpdateUserInput = c.req.valid("form");

	const updateData: {
		fullName: string | undefined;
		email: string | undefined;
		verifiedEmail: boolean | undefined;
	} = {
		fullName: fullName || c.get("user").fullName,
		email: undefined,
		verifiedEmail: undefined,
	};

	if (email) {
		updateData.email = email;
		updateData.verifiedEmail = false;
	}

	const user = await User.findByIdAndUpdate(
		c.get("user")?._id,
		{
			$set: updateData,
		},
		{ new: true }
	).select("-password");

	return c.json(user, 200);
});

const updateUserAvatar = createMiddleware<AppEnv>(async (c) => {
	const { avatar }: AvatarUpdateInput = c.req.valid("form");

	await Bun.write("public/temp/" + avatar.name, avatar);

	const avatarLink = (await uploadOnCloudinary("public/temp/" + avatar.name))
		.url;

	if (!avatarLink) {
		throw new ApiError(400, "Error while uploading avatar");
	}

	const user = await User.findByIdAndUpdate(
		c.get("user")._id,
		{
			$set: { avatar: avatarLink },
		},
		{ new: true }
	).select("-password");

	return c.json(user, 200);
});

const updateCoverImage = createMiddleware<AppEnv>(async (c) => {
	const { coverImage }: CoverImageUpdateInput = c.req.valid("form");

	await Bun.write("public/temp/" + coverImage.name, coverImage);

	const avatarLink = (
		await uploadOnCloudinary("public/temp/" + coverImage.name)
	).url;

	if (!avatarLink) {
		throw new ApiError(400, "Error while uploading avatar");
	}

	const user = await User.findByIdAndUpdate(
		c.get("user")._id,
		{
			$set: { avatar: avatarLink },
		},
		{ new: true }
	).select("-password");

	return c.json(user, 200);
});

const getUserChannelProfile = createMiddleware<AppEnv>(async (c) => {
	const { username }: ChannelProfileInput = c.req.valid("param");

	const channel = await User.aggregate([
		{
			$match: {
				username: username.toLowerCase(),
			},
		},
		{
			$lookup: {
				from: "Subscription",
				localField: "_id",
				foreignField: "channel",
				as: "subscribers",
			},
		},
		{
			$lookup: {
				from: "Subscription",
				localField: "_id",
				foreignField: "subscriber",
				as: "subscribedTo",
			},
		},
		{
			$addFields: {
				subscribersCount: { $size: "$subscribers" },
				channelSubscribedToCount: { $size: "$subscribedTo" },
				isSubscribed: {
					$cond: {
						if: {
							$in: [c.get("user")._id, "$subscribers.subscriber"],
						},
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				fullName: 1,
				username: 1,
				subscribersCount: 1,
				channelSubscribedToCount: 1,
				isSubscribed: 1,
				avatar: 1,
				coverImage: 1,
				email: 1,
			},
		},
	]);

	if (!channel?.length) {
		throw new ApiError(404, "Channel not found");
	}

	return c.json(channel[0], 200);
});

const getWatchHistory = createMiddleware<AppEnv>(async (c) => {
	const user: UserDocument[] = await User.aggregate([
		{
			$match: {
				_id: c.get("user")._id,
			},
		},
		{
			$lookup: {
				from: "videos",
				localField: "watchHistory",
				foreignField: "_id",
				as: "watchHistory",
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "owner",
							foreignField: "_id",
							as: "owner",
							pipeline: [
								{
									$project: {
										fullName: 1,
										username: 1,
										avatar: 1,
									},
								},
							],
						},
					},
					{
						$addFields: {
							owner: {
								$first: "$owner",
							},
						},
					},
				],
			},
		},
	]);

	return c.json(user[0].watchHistory, 200);
});

const startEmailVerification = createMiddleware<AppEnv>(async (c) => {
	const email = await emailVerificationLink(c.get("user"));
	if (email === null) {
		throw new ApiError(403, "Email Already Verified");
	} else {
		return c.status(200);
	}
});

const verifyEmail = createMiddleware<AppEnv>(async (c) => {
	const { token }: VerifyEmailInput = c.req.valid("param");

	const decodedToken = await verify(
		token,
		import.meta.env.REFRESH_TOKEN_SECRET as string
	);

	const user = await User.findById(decodedToken._id);
	if (!user) {
		throw new ApiError(400, "Invalid Token");
	}
	if (user.email === decodedToken.email && user.verifiedEmail) {
		throw new ApiError(400, "Email Already Verified");
	}
	if (user.email !== decodedToken.email) {
		throw new ApiError(400, "Invalid Token");
	}
	user.verifiedEmail = true;
	await user.save();

	return c.status(200);
});

export {
	regitserUser,
	loginUser,
	logoutUser,
	changeCurrentPassword,
	getCurrentUser,
	updateAccountDetails,
	updateUserAvatar,
	updateCoverImage,
	refreshAccessToken,
	getUserChannelProfile,
	getWatchHistory,
	startEmailVerification,
	verifyEmail,
};
