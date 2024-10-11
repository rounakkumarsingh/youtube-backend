import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
    createTweet,
    deleteTweet,
    updateTweet,
    getUserTweets,
} from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(
    upload.array("attachments", 8),
    createTweet
);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
