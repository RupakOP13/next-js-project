import { getResendClient } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import type { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        const resend = getResendClient();

        const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
            to: email,
            subject: "Verify your MstryMessage account",
            react: VerificationEmail({ username, otp: verifyCode }),
        });

        if (error) {
            console.error(
                "Resend rejected verification email:",
                JSON.stringify(error, Object.getOwnPropertyNames(error))
            );
            return {
                success: false,
                message: "Verification email could not be sent. Check the email address or Resend configuration.",
            };
        }

        return {
            success: true,
            message: "Verification email sent successfully.",
        };

    } catch (error) {
        console.error("Error sending verification email:", error);
        return {
            success: false,
            message: "Failed to send verification email.",
        };
    }
}









