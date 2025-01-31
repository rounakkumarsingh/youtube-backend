import { type Model, Schema, model, type ObjectId } from "mongoose";

interface IVideo extends Document {
	videoFile: string;
	thumbnail: string;
	title: string;
	description?: string;
	duration: number;
	views: number;
	isPublished: boolean;
	owner: ObjectId;
}

type VideoModel = Model<IVideo, object, object>;

const videoSchema = new Schema<IVideo, VideoModel>(
	{
		videoFile: {
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
			required: true,
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

const Video = model<IVideo, VideoModel>("Video", videoSchema);

export type VideoDocument = InstanceType<typeof Video> & IVideo & Document;

export default Video;
