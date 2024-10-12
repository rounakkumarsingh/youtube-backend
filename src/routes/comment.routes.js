import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addCommentToComment,
    addCommentToTweet,
    addCommentToVideo,
    deleteComment,
    getCommentComments,
    getTweetComments,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
const router = Router();
router.use(verifyJWT);

router.route("/video/:videoId").get(getVideoComments).post(addCommentToVideo);
router
    .route("/comment/:commentId")
    .get(getCommentComments)
    .post(addCommentToComment);
router.route("/tweet/:tweetId").get(getTweetComments).post(addCommentToTweet);

router
    .route("/comment/:commentId/manage")
    .delete(deleteComment)
    .patch(updateComment);
export default router;
