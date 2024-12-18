import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    updateTweet,
    getUserTweets,
} from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(upload.array("attachments", 8), createTweet);
router.route("/user/:userId").get(getUserTweets);
router
    .route("/:tweetId")
    .patch(upload.array("newAttachments"), updateTweet)
    .delete(deleteTweet);

export default router;
