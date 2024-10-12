import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscriber = await User.findById(subscriberId);

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriber._id,
    }).populate("channel", "name avatar");

    res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscriber = req.user;
    const subscription = await Subscription.findOne({
        subscriber: subscriber._id,
        channel: channel._id,
    });

    if (subscription) {
        await subscription.deleteOne();
        res.status(200).json(
            new ApiResponse(200, null, "Subscription removed successfully")
        );
    } else {
        await Subscription.create({
            subscriber: subscriber._id,
            channel: channel._id,
        });
        res.status(201).json(
            new ApiResponse(201, null, "Subscription added successfully")
        );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({
        channel: channel._id,
    }).select({ subscriber: 1 });

    res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    );
});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
