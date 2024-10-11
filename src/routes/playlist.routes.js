import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    deleteVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createPlaylist);

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .put(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").put(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").put(deleteVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylist);

export default router;
