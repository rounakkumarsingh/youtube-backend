import { createMiddleware } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import ApiError from "../utils/ApiError";
import { z } from "zod";
import type { AppEnv } from "../constants";
import { verify } from "hono/jwt";
import User from "../models/user.model";
import { every } from "hono/combine";

interface ValidatedCookies {
	accessToken: string;
	refreshToken: string;
}

const verifyJWT = every(
	zValidator(
		"cookie",
		z.object({
			accessToken: z.string(),
			refreshToken: z.string(),
		}),
		(result) => {
			if (!result.success) {
				throw new ApiError(401, "Unauthorized");
			}
		}
	),
	createMiddleware<AppEnv>(async (c, next) => {
		try {
			const token: string =
				(c.req.valid("cookie") as ValidatedCookies).accessToken ||
				(c.req.header("Authorization") as string).replace(
					"Bearer ",
					""
				);
			if (!token) {
				throw new ApiError(401, "Unauthorized request");
			}
			const decodedToken = await verify(
				token,
				import.meta.env.ACCESS_TOKEN_SECRET as string
			);

			const user = await User.findById(decodedToken?._id).select(
				"-password -refreshToken"
			);

			if (!user) {
				throw new ApiError(401, "Invalid Access Token");
			}

			c.set("user", user);
			await next();
		} catch (error) {
			throw new ApiError(
				401,
				(error as Error)?.message || "Invalid access token"
			);
		}
	})
);
export default verifyJWT;
