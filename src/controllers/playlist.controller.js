import Playlist from "../models/playlist.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });
    res.status(201).json(new ApiResponse(201, playlist, "Playlist created"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId).populate({
        path: "videos",
        select: "title duration createdAt owner thumbnail",
    });
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    res.json(new ApiResponse(200, playlist, "Playlist found"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }
    playlist.name = name;
    playlist.description = description;
    await playlist.save();
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this playlist"
        );
    }
    await playlist.remove();
    return res.status(200).json(new ApiResponse(200, null, "Playlist deleted"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }
    playlist.videos.push(videoId);
    await playlist.save();
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const deleteVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist");
    }
    playlist.videos = playlist.videos.filter(
        (video) => video.toString() !== videoId
    );
    await playlist.save();
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const playlists = await Playlist.find({ owner: user._id });
    res.json(new ApiResponse(200, playlists, "User playlists found"));
});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    deleteVideoFromPlaylist,
    getUserPlaylist,
};
