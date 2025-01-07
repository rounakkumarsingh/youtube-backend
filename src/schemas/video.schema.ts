import { z } from "zod";
import { isValidObjectId } from "mongoose";

export const uploadVideoSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	thumbnail: z.instanceof(File),
	video: z.instanceof(File),
});

export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;

export const getVideoSchema = z.object({
	videoId: z.string().refine(isValidObjectId, "Invalid video id"),
});

export type GetVideoInput = z.infer<typeof getVideoSchema>;

export const deleteVideoSchema = z.object({
	videoId: z.string().refine(isValidObjectId, "Invalid video id"),
});

export type DeleteVideoInput = z.infer<typeof deleteVideoSchema>;

export const updateVideoParamSchema = z.object({
	videoId: z.string().refine(isValidObjectId, "Invalid video id"),
});

export type UpdateVideoParamInput = z.infer<typeof updateVideoParamSchema>;

export const updateVideoFormSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
});

export type UpdateVideoFormInput = z.infer<typeof updateVideoFormSchema>;

export const togglePublishStatusSchema = z.object({
	videoId: z.string().refine(isValidObjectId, "Invalid video id"),
});

export type TogglePublishStatusInput = z.infer<
	typeof togglePublishStatusSchema
>;
