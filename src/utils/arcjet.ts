import arcjet, {
	protectSignup,
	sensitiveInfo,
	shield,
	tokenBucket,
} from "@arcjet/bun";
import Bun from "bun";

const aj = arcjet({
	key: Bun.env.ARCJET_KEY!,
	rules: [
		shield({ mode: "LIVE" }),
		tokenBucket({
			mode: "LIVE",
			refillRate: 5,
			interval: 10,
			capacity: 10,
		}),
		sensitiveInfo({
			mode: "LIVE",

			deny: ["CREDIT_CARD_NUMBER", "EMAIL", "PHONE_NUMBER", "IP_ADDRESS"],
		}),
	],
});

const signUpProtection = arcjet({
	key: Bun.env.ARCJET_KEY!,
	rules: [
		protectSignup({
			email: {
				mode: "LIVE",
				block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
			},
			bots: {
				mode: "LIVE",
				allow: ["GOOGLE_ADSENSE"],
			},
			rateLimit: {
				mode: "LIVE",
				interval: "10m",
				max: 100,
			},
		}),
	],
});

export { signUpProtection };

export default aj;
