import type { StatusCode } from "hono/utils/http-status";

class ApiError extends Error {
	public statusCode: StatusCode;
	public success: boolean;
	public data: object | null | string;
	public errors: string[];
	constructor(
		statusCode: StatusCode,
		message = "Something went wrong",
		errors = [],
		stack = ""
	) {
		super(message);
		this.statusCode = statusCode;
		this.success = false;
		this.data = null;
		this.errors = errors;
		this.stack = stack;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export default ApiError;
