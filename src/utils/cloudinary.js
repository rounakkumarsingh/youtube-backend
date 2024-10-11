import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "./ApiError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log("File is uplaoded on cloudinary: ", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
    }
};

const deleteFromCloudinary = async (pathOnCloudinary) => {
    try {
        if (!pathOnCloudinary) {
            return null;
        }
        pathOnCloudinary.forEach(async (path) => {
            await cloudinary.uploader.destroy(pathOnCloudinary, (result) => {
                console.log(result);
            });
        });
    } catch (error) {
        throw new ApiError(500, "Error deleting file from cloudinary");
    }
};

export { uplodOnCloudinary, deleteFromCloudinary };
