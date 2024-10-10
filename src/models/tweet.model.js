import { model, Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Tweet = model("Tweet", tweetSchema);

export default Tweet;
