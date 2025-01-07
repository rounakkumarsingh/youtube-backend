import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "node:fs";
import Bun from "bun";
import ApiError from "./ApiError";
import logger from "./logger";

cloudinary.config({
	cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
	api_key: import.meta.env.CLOUDINARY_API_KEY,
	api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath: string) => {
	const file = Bun.file(filePath);
	await file.exists();
	const response = await cloudinary.uploader.upload(filePath, {
		resource_type: "auto",
	});
	unlinkSync(filePath);
	return response;
};

export const deleteFromCloudinary = async (cloudinaryLink: string) => {
	try {
		const publicId = cloudinaryLink
			.split("/")
			.pop()
			?.split(".")[0] as string;
		return await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		logger.error(error);
		throw new ApiError(500, "Internal server error");
	}
};
