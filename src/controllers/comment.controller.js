import Comment from "../models/comment.model.js";
import Tweet from "../models/tweet.model.js";
import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const aggregateQuery = Comment.aggregate([
        {
            $match: { video: video?._id }, // Filter comments by videoId
        },
        {
            $sort: { createdAt: -1 }, // Sort comments by creation date (newest first)
        },
    ]);

    const options = {
        page,
        limit,
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);
    res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});

const getCommentComments = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const aggregateQuery = Comment.aggregate([
        {
            $match: { comment: comment?._id }, // Filter comments by tweetId
        },
        {
            $sort: { createdAt: -1 }, // Sort comments by creation date (newest first)
        },
    ]);

    const options = {
        page,
        limit,
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);
    res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    const aggregateQuery = Comment.aggregate([
        {
            $match: { tweet: tweet?._id }, // Filter comments by tweetId
        },
        {
            $sort: { createdAt: -1 }, // Sort comments by creation date (newest first)
        },
    ]);

    const options = {
        page,
        limit,
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);
    res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});

const addCommentToVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (req.user.verifiedEmail === false) {
        throw new ApiError(403, "Email not verified");
    }

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: video._id,
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});
const addCommentToComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (req.user.verifiedEmail === false) {
        throw new ApiError(403, "Email not verified");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const newComment = await Comment.create({
        content,
        comment: comment._id,
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, newComment, "Comment added"));
});
const addCommentToTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (req.user.verifiedEmail === false) {
        throw new ApiError(403, "Email not verified");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const comment = await Comment.create({
        content,
        tweet: tweet._id,
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        );
    }
    await comment.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }
    comment.content = content;
    await comment.save();
    res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
});

export {
    getVideoComments,
    getCommentComments,
    getTweetComments,
    addCommentToVideo,
    addCommentToComment,
    addCommentToTweet,
    deleteComment,
    updateComment,
};
