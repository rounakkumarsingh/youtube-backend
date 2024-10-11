import { asyncHandler } from "../utils/asyncHandler.js";
import User  from "../models/user.model.js";
import Tweet  from "../models/tweet.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uplodOnCloudinary } from "../utils/cloudinary.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const attachmentsLocalPaths = req.files?.attachments;

    const user = await User.findById(req.user?._id);

    const attachments = [];
    attachmentsLocalPaths.forEach(async (attachmentLocalPath) => {
        const attachment = await uplodOnCloudinary(attachmentLocalPath);
        attachments.push(attachment.url);
    });

    const newTweet = await Tweet.create(
        {
            owner: user?._id,
            content,
            attachments,
        },
        { timestamps: true }
    );

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

    const tweets = await Tweet.find({owner: userId});

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params;
    const tweet = Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet Not found");
    }

    const { newContent } = req.body;

    const newAttachmentsLocalPaths = req.files?.newAttachments;

    const newAttachments = [];
    newAttachmentsLocalPaths.forEach(async (newAttachmentsLocalPath) => {
        const newAttachment = await uplodOnCloudinary(newAttachmentsLocalPath);
        newAttachments.push(newAttachment.url);
    });

    tweet.content = newContent;
    const oldAttachments = tweet.attachments;
    tweet.attachments = newAttachments;
    const updatedTweet = await tweet.save();
    await deleteFromCloudinary(oldAttachments)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
    
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params;
    const tweet = Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet Not found");
    }
    if (tweet.owner !== req.user?._id) {
        throw new ApiError(401, "You are not authorized to delete this tweet");
    }

    const attachments = tweet.attachments;
    await tweet.delete();
    await deleteFromCloudinary(attachments);
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
