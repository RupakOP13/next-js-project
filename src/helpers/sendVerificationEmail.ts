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

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Verify your MstryMessage account",
            react: VerificationEmail({ username, otp: verifyCode }),
        });
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









