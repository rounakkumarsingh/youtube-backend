import { zValidator } from "@hono/zod-validator";
import {
	avatarUpdateSchema,
	channelProfileSchema,
	coverImageUpdateSchema,
	loginUserSchema,
	passwordChangeSchema,
	regitserUserSchema,
	updateUserSchema,
	verifyEmailSchema,
} from "../../schemas/user.schema";
import ApiError from "../../utils/ApiError";

const registerValidator = zValidator("form", regitserUserSchema, (result) => {
	if (!result.success) {
		throw new ApiError(400, "Invalid form data");
	}
});

const loginValidator = zValidator("form", loginUserSchema, (result) => {
	if (!result.success) {
		throw new ApiError(400, "Invalid form data");
	}
	if (!result.data.email && !result.data.username) {
		throw new ApiError(400, "Email or username is required");
	}
});

const passwordChangeValidator = zValidator(
	"form",
	passwordChangeSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid form data");
		}
	}
);

const updateAccountValidator = zValidator(
	"form",
	updateUserSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid form data");
		}
		if (!result.data.fullName && !result.data.email) {
			throw new ApiError(400, "Full name or email is required");
		}
	}
);

const avatarUpdateValidator = zValidator(
	"form",
	avatarUpdateSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid form data");
		}
	}
);

const coverImageUpdateValidator = zValidator(
	"form",
	coverImageUpdateSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid form data");
		}
	}
);

const channelProfileValidator = zValidator(
	"param",
	channelProfileSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid channel username");
		}
	}
);

const verifyEmailValidator = zValidator(
	"param",
	verifyEmailSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid token");
		}
	}
);

export {
	registerValidator,
	loginValidator,
	passwordChangeValidator,
	updateAccountValidator,
	avatarUpdateValidator,
	coverImageUpdateValidator,
	channelProfileValidator,
	verifyEmailValidator,
};
