import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Tweet from "../models/tweet.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
	deleteFromCloudinary,
	uplodOnCloudinary,
} from "../utils/cloudinary.js";

const createTweet = asyncHandler(async (req, res) => {
	const { content } = req.body;
	if (!content) {
		throw new ApiError(400, "Content is required");
	}

	if (req.user.verifiedEmail === false) {
		throw new ApiError(403, "Email not verified");
	}

	const attachmentsLocalPaths =
		req.files?.map((attachment) => attachment.path) || [];

	const attachments = await Promise.all(
		attachmentsLocalPaths.map(async (attachmentLocalPath) => {
			const attachment = await uplodOnCloudinary(attachmentLocalPath);
			return attachment.url;
		})
	);

	const newTweet = await Tweet.create({
		owner: req.user._id,
		content: content,
		attachments,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, newTweet, "Tweet uploaded successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const user = await User.findById(userId);

	if (!user) {
		throw new ApiError(400, "User not found");
	}

	const tweets = await Tweet.find({ owner: userId });

	return res
		.status(200)
		.json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;

	const tweet = await Tweet.findById(tweetId);
	if (!tweet) {
		throw new ApiError(404, "Tweet Not found");
	}
	if (tweet.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(401, "You are not authorized to update this tweet");
	}

	const { newContent } = req.body;
	let deleteUrls = req.body.deleteUrls || [];
	if (!Array.isArray(deleteUrls)) {
		deleteUrls = [deleteUrls];
	}
	const invalidDeleteUrls = Array.isArray(deleteUrls)
		? deleteUrls.filter((url) => !tweet.attachments.includes(url))
		: [];
	console.log(deleteUrls);
	if (invalidDeleteUrls.length > 0) {
		throw new ApiError(
			400,
			"Some URLs to delete are not in the tweet attachments"
		);
	}

	const newAttachmentsLocalPath = req.files || [];
	const newAttachments = await Promise.all(
		newAttachmentsLocalPath.map(async (attachment) => {
			const newAttachment = await uplodOnCloudinary(attachment.path);
			return newAttachment.url;
		})
	);

	tweet.content = newContent || tweet.content;
	tweet.attachments = tweet.attachments.concat(newAttachments);
	tweet.attachments = tweet.attachments.filter(
		(attachment) => !deleteUrls.includes(attachment)
	);

	await tweet.save();
	await deleteFromCloudinary(deleteUrls);

	return res
		.status(200)
		.json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	const tweet = await Tweet.findById(tweetId);
	if (!tweet) {
		throw new ApiError(404, "Tweet Not found");
	}
	if (tweet.owner.toString() !== req.user?._id.toString()) {
		throw new ApiError(401, "You are not authorized to delete this tweet");
	}

	const attachments = tweet.attachments;
	await tweet.deleteOne();
	await deleteFromCloudinary(attachments);
	return res
		.status(200)
		.json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
