/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function changePassword(formData: FormData): Promise<any> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
        return {
            success: false,
            message: "Please login first.",
        };
    }

    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");
    const confirmNewPassword = formData.get("confirmNewPassword");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return {
            success: false,
            message: "All password fields are required.",
        };
    }

    if (newPassword !== confirmNewPassword) {
        return {
            success: false,
            message: "New passwords do not match.",
        };
    }

    try {
        const res = await fetch(`${BASE_URL}/auth/change-password`, {
            method: "PUT",
            headers: {
                Authorization: accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oldPassword,
                newPassword,
            }),
        });

        const result = await res.json();

        if (!res.ok || !result?.success) {
            return {
                success: false,
                message: result?.message || "Failed to change password.",
            };
        }

        revalidatePath("/admin/dashboard/settings");

        return {
            success: true,
            message: result?.message || "Password updated successfully.",
        };
    } catch (error) {
        console.error("Change password failed:", error);
        return {
            success: false,
            message: "Something went wrong while updating your password.",
        };
    }
}
