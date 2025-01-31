import { type Aggregate, type Model, Schema, type Types, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IComment extends Document {
	content: string;
	video?: Types.ObjectId;
	tweet?: Types.ObjectId;
	comment?: Types.ObjectId;
	owner: Types.ObjectId;
}

interface ICommentStatics extends Model<IComment> {
	aggregatePaginate(
		query: Aggregate<any[]>,
		{ page, limit }: { page: number; limit: number }
	): object;
}

type CommnetModel = Model<IComment, ICommentStatics, object>;

const commentSchema = new Schema<IComment, CommnetModel>(
	{
		content: {
			type: String,
			required: true,
		},
		video: {
			type: Schema.Types.ObjectId,
			ref: "Video",
		},
		tweet: {
			type: Schema.Types.ObjectId,
			ref: "Tweet",
		},
		comment: {
			type: Schema.Types.ObjectId,
			ref: "Comment",
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = model<IComment, ICommentStatics, object>(
	"Comment",
	commentSchema
);

export type CommentDocument = InstanceType<typeof Comment> &
	IComment &
	Document;

export default Comment;
