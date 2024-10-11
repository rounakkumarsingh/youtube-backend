import { model, Schema } from "mongoose";

const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

likeSchema.pre("validate", function (next) {
    if (!this.comment && !this.video && !this.tweet) {
        this.invalidate(
            "comment",
            "At least one of video, comment, or tweet must be present."
        );
        this.invalidate(
            "video",
            "At least one of video, comment, or tweet must be present."
        );
        this.invalidate(
            "tweet",
            "At least one of video, comment, or tweet must be present."
        );
    }
    next();
});

const Like = model("Like", likeSchema);

export default Like;
