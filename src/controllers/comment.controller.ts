import { createMiddleware } from "hono/factory";
import Comment from "../models/comments.model";
import Tweet from "../models/tweet.model";
import Video from "../models/video.model";
import ApiError from "../utils/ApiError";
import type { AppEnv } from "../constants";

const getVideoComments = createMiddleware<AppEnv>(async (c) => {
	const { videoId } = c.req.valid("param");
	const { page = 1, limit = 10 } = c.req.valid("query");
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
	return c.json(comments, 200);
});

const getCommentComments = createMiddleware<AppEnv>(async (c) => {
	const { commentId } = c.req.valid("param");
	const { page = 1, limit = 10 } = c.req.valid("query");
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
	return c.json(comments, 200);
});

const getTweetComments = createMiddleware<AppEnv>(async (c) => {
	const { tweetId } = c.req.valid("param");
	const { page = 1, limit = 10 } = c.req.valid("query");
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
	return c.json(comments, 200);
});

const addCommentToVideo = createMiddleware<AppEnv>(async (c) => {
	const { videoId } = c.req.valid("param");

	if (c.get("user")?.verifiedEmail === false) {
		throw new ApiError(403, "Email not verified");
	}

	if (!videoId) {
		throw new ApiError(400, "Video ID is required");
	}
	const { content } = c.req.valid("form");

	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	const comment = await Comment.create({
		content,
		video: video._id,
		owner: c.get("user")?._id,
	});

	return c.json(comment, 200);
});

const addCommentToComment = createMiddleware<AppEnv>(async (c) => {
	const { commentId } = c.req.valid("param");
	const { content } = c.req.valid("form");

	if (c.get("user")?.verifiedEmail === false) {
		throw new ApiError(403, "Email not verified");
	}

	const comment = await Comment.findById(commentId);
	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}

	const newComment = await Comment.create({
		content,
		comment: comment._id,
		owner: c.get("user")?._id,
	});

	return c.json(newComment, 200);
});

const addCommentToTweet = createMiddleware<AppEnv>(async (c) => {
	const { tweetId } = c.req.valid("param");
	const { content } = c.req.valid("form");

	if (c.get("user")?.verifiedEmail === false) {
		throw new ApiError(403, "Email not verified");
	}

	const tweet = await Tweet.findById(tweetId);
	if (!tweet) {
		throw new ApiError(404, "Tweet not found");
	}

	const comment = await Comment.create({
		content,
		tweet: tweet._id,
		owner: c.get("user")?._id,
	});

	return c.json(comment, 200);
});

const deleteComment = createMiddleware<AppEnv>(async (c) => {
	const { commentId } = c.req.valid("param");
	const comment = await Comment.findById(commentId);
	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}
	if (comment.owner.toString() !== c.get("user")._id.toString()) {
		throw new ApiError(
			403,
			"You are not authorized to delete this comment"
		);
	}
	await comment.deleteOne();
	return c.status(200);
});

const updateComment = createMiddleware<AppEnv>(async (c) => {
	const { commentId } = c.req.valid("param");
	const { content } = c.req.valid("form");

	const comment = await Comment.findById(commentId);
	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}
	if (comment.owner.toString() !== c.get("user")?._id.toString()) {
		throw new ApiError(
			403,
			"You are not authorized to update this comment"
		);
	}
	comment.content = content;
	await comment.save();
	return c.json(comment, 200);
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
