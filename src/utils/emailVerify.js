import jwt from "jsonwebtoken";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

export default async function emailVerificationLink(user) {
    if (user.verifiedEmail === true) {
        return null;
    }

    const payload = {
        id: user._id,
        email: user.email,
        time: Date.now(),
    };

    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1h",
    });

    const url = `${process.env.BASE_URL}/users/verify-email/${token}`;

    const HTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; -webkit-font-smoothing: antialiased;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 48px 40px 0;">
                                <img src="https://via.placeholder.com/120x40" alt="Your Logo" style="display: block; height: 40px; width: auto; margin-bottom: 24px;">
                                <h1 style="color: #1a202c; font-size: 28px; font-weight: 700; margin: 0 0 24px;">Verify Your Email Address</h1>
                                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">Hello,</p>
                                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">Thank you for signing up! To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 0 40px;">
                                <table role="presentation" style="border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="background-color: #4299e1; border-radius: 4px;">
                                            <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; transition: background-color 0.3s ease;">Verify Email Address</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 24px 40px 48px;">
                                <p style="color: #4a5568; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">If the button above doesn't work, you can also verify your email by copying and pasting the following link into your browser:</p>
                                <p style="color: #4a5568; font-size: 14px; line-height: 1.5; margin: 0 0 24px; word-break: break-all;">
                                    <a href="${url}" style="color: #4299e1; text-decoration: none; font-weight: 500;">${url}</a>
                                </p>
                                <p style="color: #4a5568; font-size: 14px; line-height: 1.5; margin: 0 0 24px;">If you didn't create an account, you can safely ignore this email.</p>
                                <p style="color: #4a5568; font-size: 14px; line-height: 1.5; margin: 0;">Best regards,<br>Your App Team</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #edf2f7; padding: 24px 40px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                <p style="color: #718096; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">This is an automated email. Please do not reply.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const { data, error } = await resend.emails.send({
        from: "admin@videotube.rounakkumarsingh.me",
        to: user.email,
        subject: "Email Verification",
        html: HTML,
    });

    if (process.env.NODE_ENV === "development") {
        console.log(data, error);
    }

    return { data, error };
}
