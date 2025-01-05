import { z } from "zod";

export const regitserUserSchema = z.object({
	fullName: z.string().min(3).max(255),
	email: z.string().email(),
	username: z.string().min(3).max(20),
	password: z.string().min(6).max(30),
	avatar: z.instanceof(File),
	coverImage: z.instanceof(File).optional(),
});

export type RegisterInput = z.infer<typeof regitserUserSchema>;

export const loginUserSchema = z.object({
	email: z.string().email().optional(),
	username: z.string().min(3).max(20).optional(),
	password: z.string().min(6).max(30),
});

export type LoginInput = z.infer<typeof loginUserSchema>;

export const passwordChangeSchema = z.object({
	oldPassword: z.string().min(6).max(30),
	newPassword: z.string().min(6).max(30),
});

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export const updateUserSchema = z.object({
	fullName: z.string().optional(),
	email: z.string().email().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const avatarUpdateSchema = z.object({
	avatar: z.instanceof(File),
});

export type AvatarUpdateInput = z.infer<typeof avatarUpdateSchema>;

export const coverImageUpdateSchema = z.object({
	coverImage: z.instanceof(File),
});

export type CoverImageUpdateInput = z.infer<typeof coverImageUpdateSchema>;

export const channelProfileSchema = z.object({
	username: z.string().min(3).max(20),
});

export type ChannelProfileInput = z.infer<typeof channelProfileSchema>;

export const verifyEmailSchema = z.object({
	token: z.string(),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
