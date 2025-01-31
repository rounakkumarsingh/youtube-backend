import { type Model, Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ITweet extends Document {
	content: string;
	attachments: string[];
	owner: Schema.Types.ObjectId;
}

type TweetModel = Model<ITweet, object, object>;

const tweetSchema = new Schema<ITweet, TweetModel>(
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
		attachments: [
			{
				type: String,
				default: [],
			},
		],
	},
	{ timestamps: true }
);

tweetSchema.plugin(mongooseAggregatePaginate);

const Tweet = model("Tweet", tweetSchema);

export type TweetDocument = InstanceType<typeof Tweet> & ITweet & Document;

export default Tweet;
