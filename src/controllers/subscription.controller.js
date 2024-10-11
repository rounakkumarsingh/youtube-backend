import { asyncHandler } from "../utils/asyncHandler.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {});
const toggleSubscription = asyncHandler(async (req, res) => {});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
