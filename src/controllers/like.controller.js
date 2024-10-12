import Like from "../models/like.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Tweet from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const user = req.user;
    const like = await Like.findOne({ video: videoId, likedBy: user._id });

    if (like) {
        await like.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Video unliked"));
    } else {
        const newLike = await Like.create({
            video: videoId,
            likedBy: user._id,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, "Video liked"));
    }
});
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const user = req.user;
    const like = await Like.findOne({ comment: commentId, likedBy: user._id });

    if (like) {
        await like.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment unliked"));
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: user._id,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, "Comment liked"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    const user = req.user;
    const like = await Like.findOne({ tweet: tweetId, likedBy: user._id });
    if (like) {
        await like.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet unliked"));
    } else {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: user._id,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, "Tweet liked"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likes = await Like.find({
        likedBy: userId,
        video: { $exists: true },
    }).select({
        video: 1,
    });
    return res.status(200).json(new ApiResponse(200, likes, "Liked videos"));
});

const getLikedComments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likes = await Like.find({
        likedBy: userId,
        comment: { $exists: true },
    }).select({
        comment: 1,
    });
    return res.status(200).json(new ApiResponse(200, likes, "Liked comments"));
});

const getLikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likes = await Like.find({
        likedBy: userId,
        tweet: { $exists: true },
    }).select({
        tweet: 1,
    });
    return res.status(200).json(new ApiResponse(200, likes, "Tweet comments"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets,
};
