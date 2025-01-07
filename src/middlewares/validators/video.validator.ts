import { zValidator } from "@hono/zod-validator";
import {
	deleteVideoSchema,
	getVideoSchema,
	togglePublishStatusSchema,
	updateVideoFormSchema,
	updateVideoParamSchema,
	uploadVideoSchema,
} from "../../schemas/video.schema";
import ApiError from "../../utils/ApiError";

const uploadVideoValidator = zValidator("form", uploadVideoSchema, (result) => {
	if (!result.success) {
		throw new ApiError(400, "Invalid form data");
	}
});

const getVideoValidator = zValidator("param", getVideoSchema, (result) => {
	if (!result.success) {
		throw new ApiError(400, "Invalid query data");
	}
});

const deleteVideoValidator = zValidator(
	"param",
	deleteVideoSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid query data");
		}
	}
);

const updateVideoFormValidator = zValidator(
	"form",
	updateVideoFormSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid form data");
		}
	}
);

const updateVideoParamValidator = zValidator(
	"param",
	updateVideoParamSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid param data");
		}
	}
);

const togglePublishStatusValidator = zValidator(
	"param",
	togglePublishStatusSchema,
	(result) => {
		if (!result.success) {
			throw new ApiError(400, "Invalid param data");
		}
	}
);

export {
	uploadVideoValidator,
	getVideoValidator,
	deleteVideoValidator,
	updateVideoFormValidator,
	updateVideoParamValidator,
	togglePublishStatusValidator,
};
