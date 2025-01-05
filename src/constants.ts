import type { UserDocument } from "./models/user.model";

const DB_NAME = "videotube";

type AppEnv = {
	Variables: {
		user: UserDocument;
	};
};

export const cookieOptions = {
	httpOnly: true,
	secure: true,
};

export { DB_NAME, type AppEnv };
