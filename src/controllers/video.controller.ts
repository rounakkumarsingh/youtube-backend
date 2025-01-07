import { createMiddleware } from "hono/factory";
import { type AppEnv } from "../constants";
import ApiError from "../utils/ApiError";
import type {
	DeleteVideoInput,
	TogglePublishStatusInput,
	UpdateVideoFormInput,
	UpdateVideoParamInput,
	UploadVideoInput,
} from "../schemas/video.schema";
import Bun from "bun";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import Video from "../models/video.model";
import User from "../models/user.model";
import type { Schema } from "mongoose";

const getAllVideos = createMiddleware<AppEnv>(async (c) => {
	return c.text("To be implemented", 501);
});

const publishVideo = createMiddleware<AppEnv>(async (c) => {
	const { title, description, video, thumbnail }: UploadVideoInput =
		c.req.valid("form");

	if (c.get("user")?.verifiedEmail === false) {
		throw new ApiError(403, "Email not verified");
	}

	const videoLocalPath = "public/temp" + video.name;
	const thumbnailLocalPath = "public/temp" + thumbnail.name;

	await Bun.write(videoLocalPath, video);
	await Bun.write(thumbnailLocalPath, thumbnail);

	const videoLink = await uploadOnCloudinary(videoLocalPath);
	const thumbnailLink = await uploadOnCloudinary(thumbnailLocalPath);

	const newVideo = await Video.create({
		videoFile: videoLink,
		thumbnail: thumbnailLink,
		title,
		description,
		duration: videoLink.duration as number,
		owner: c.get("user")?._id,
	});
	const createdVideo = await Video.findById(newVideo._id);

	if (!createdVideo) {
		throw new ApiError(500, "Video not created, Please try again.");
	}
	return c.json(createdVideo, 200);
});

const getVideoById = createMiddleware<AppEnv>(async (c) => {
	const { videoId } = c.req.valid("param");

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	if (video.isPublished === true) {
		video.views += 1;
		const user = await User.findById(c.get("user")?._id);
		if (
			user != null &&
			(user.watchHistory.length === 0 ||
				user.watchHistory[user.watchHistory.length - 1].toString() !==
					video._id.toString())
		) {
			user.watchHistory.push(
				video._id as unknown as Schema.Types.ObjectId
			);
			await Promise.all([user.save(), video.save()]);
		} else {
			await video.save();
		}
	}
	return c.json(video, 200);
});

const deleteVideo = createMiddleware<AppEnv>(async (c) => {
	const { videoId }: DeleteVideoInput = c.req.valid("param");
	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	if (video.owner.toString() !== c.get("user")?._id.toString()) {
		throw new ApiError(403, "You are not authorized to delete this video");
	}

	const videoFile = video.videoFile;
	const thumbnailFile = video.thumbnail;
	const resultDeletingFromCloudinary = [videoFile, thumbnailFile].map(
		async (link) => {
			const res = await deleteFromCloudinary(link);
			return res;
		}
	);

	await Promise.all(resultDeletingFromCloudinary);

	const resultDeletingFromDB = await video.deleteOne();

	const resultDeleting = {
		resultDeletingFromCloudinary,
		resultDeletingFromDB,
	};
	return c.json(resultDeleting, 200);
});

const updateVideo = createMiddleware<AppEnv>(async (c) => {
	const { videoId }: UpdateVideoParamInput = c.req.valid("param");
	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	if (video.owner.toString() !== c.get("user")?._id.toString()) {
		throw new ApiError(403, "You are not authorized to update this video");
	}

	const { title, description }: UpdateVideoFormInput = c.req.valid("body");

	const updatedVideo = await Video.findByIdAndUpdate(
		videoId,
		{
			title: title || video.title,
			description: description || video.description,
		},
		{ new: true }
	);
	return c.json(updatedVideo, 200);
});

const togglePublishStatus = createMiddleware<AppEnv>(async (c) => {
	const { videoId }: TogglePublishStatusInput = c.req.valid("param");
	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	if (video.owner.toString() !== c.get("user")?._id.toString()) {
		throw new ApiError(403, "You are not authorized to update this video");
	}

	const updatedVideo = await Video.findByIdAndUpdate(
		videoId,
		{
			isPublished: !video.isPublished,
		},
		{ new: true }
	);
	return c.json(updatedVideo, 200);
});

export {
	getAllVideos,
	publishVideo,
	getVideoById,
	deleteVideo,
	updateVideo,
	togglePublishStatus,
};
