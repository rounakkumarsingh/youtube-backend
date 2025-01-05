import { Model, model, Schema } from "mongoose";
import Bun from "bun";
import { sign } from "hono/jwt";

interface IUser extends Document {
	username: string;
	email: string;
	fullName: string;
	avatar: string;
	coverImage?: string;
	watchHistory: string[];
	password: string;
	refreshToken: string | null;
	verifiedEmail: boolean;
}

interface IUserMethods {
	// eslint-disable-next-line no-unused-vars
	isPasswordCorrect(password: string): Promise<boolean>;
	generateAccessToken(): Promise<string>;
	generateRefreshToken(): Promise<string>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		avatar: {
			type: String, // Cloudinary url
			required: true,
		},
		coverImage: {
			type: String,
		},
		watchHistory: [
			{
				type: Schema.Types.ObjectId,
				ref: "Video",
			},
		],
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		refreshToken: {
			type: String,
			default: null,
		},
		verifiedEmail: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await Bun.password.hash(this.password);
	next();
});

userSchema.methods.isPasswordCorrect = async function (
	password: string
): Promise<boolean> {
	return await Bun.password.verify(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
	return await sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
		},
		import.meta.env.ACCESS_TOKEN_SECRET as string
	);
};

userSchema.methods.generateRefreshToken = async function () {
	return await sign(
		{
			_id: this._id,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
		},
		import.meta.env.REFRESH_TOKEN_SECRET as string
	);
};

const User = model<IUser, UserModel>("User", userSchema);
export type UserDocument = InstanceType<typeof User> & IUser & Document;

export default User;
