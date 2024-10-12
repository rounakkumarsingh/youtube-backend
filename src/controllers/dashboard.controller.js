import { Types } from "mongoose";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Tweet from "../models/tweet.model.js";
import Subscription from "../models/subscription.model.js";
import Like from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;
    const totalVideos = await Video.countDocuments({ owner: userId });
    const totalViews = await Video.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId,
    });
    const totalLikes = await Like.countDocuments({
        $or: [
            {
                video: {
                    $in: await Video.find({ owner: userId }),
                },
            },
            {
                comment: {
                    $in: await Comment.find({ owner: userId }),
                },
            },
            {
                tweet: {
                    $in: await Tweet.find({ owner: userId }),
                },
            },
        ],
    });
    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews: totalViews[0]?.totalViews || 0,
            totalSubscribers,
            totalLikes,
        })
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;
    const videos = await Video.find({ owner: userId }).populate(
        "owner",
        "fullName avatar _id"
    );
    return res.status(200).json(new ApiResponse(200, videos));
});

export { getChannelStats, getChannelVideos };
