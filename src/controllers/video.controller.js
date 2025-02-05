import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    deleteFromCloudinary,
    uplodOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (req.user?.verifiedEmail === false) {
        throw new ApiError(403, "Email not verified");
    }

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required");
    }

    const video = await uplodOnCloudinary(videoLocalPath);
    const thumbnail = await uplodOnCloudinary(thumbnailLocalPath);

    const newVideo = await Video.create({
        videoFile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        title,
        description,
        duration: video.duration,
        owner: req.user?._id,
    });
    const createdVideo = await Video.findById(newVideo._id);

    if (!createdVideo) {
        throw new ApiError(500, "Video not created, Please try again.");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdVideo, "Video uploaded successfully")
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.isPublished === true) {
        video.views += 1;
        const user = await User.findById(req?.user?._id);
        if (
            user.watchHistory.length === 0 ||
            user.watchHistory[user.watchHistory.length - 1].toString() !==
                video._id.toString()
        ) {
            user.watchHistory.push(video._id);
            await Promise.all([user.save(), video.save()]);
        } else {
            await video.save();
        }
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    const videoFile = video.videoFile;
    const thumbnailFile = video.thumbnail;
    const resultDeletingFromCloudinary = await deleteFromCloudinary([
        videoFile,
        thumbnailFile,
    ]);

    const resultDeletingFromDB = await video.deleteOne();

    const resultDeleting = {
        resultDeletingFromCloudinary,
        resultDeletingFromDB,
    };
    return res
        .status(200)
        .json(
            new ApiResponse(200, resultDeleting, "Video deleted successfully")
        );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const { title, description } = req.body;
    if (!title && !description) {
        throw new ApiError(400, "Title or description are required");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            title: title || video.title,
            description: description || video.description,
        },
        { new: true }
    );
    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            isPublished: !video.isPublished,
        },
        { new: true }
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                "Video publish status updated successfully"
            )
        );
});
export {
    getAllVideos,
    publishVideo,
    getVideoById,
    deleteVideo,
    updateVideo,
    togglePublishStatus,
};
