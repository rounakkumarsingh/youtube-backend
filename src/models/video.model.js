import { Schema, model } from "mongoose";

const videoSchema = Schema(
    {
        videofile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            required: true,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            required: false,
            default: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Video = model("Video", videoSchema);
