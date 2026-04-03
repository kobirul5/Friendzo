/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function updateProfile(_currentState: any, formData: FormData): Promise<any> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
        return {
            success: false,
            message: "Please login first.",
        };
    }

    try {
        const payload = new FormData();
        
        // Add text data
        const data = {
            firstName: formData.get("firstName") || undefined,
            lastName: formData.get("lastName") || undefined,
            email: formData.get("email") || undefined,
            phoneNumber: formData.get("phoneNumber") || undefined,
        };

        payload.append("data", JSON.stringify(data));

        // Add profile image if provided
        const profileImage = formData.get("profileImage");
        if (profileImage instanceof File && profileImage.size > 0) {
            payload.append("images", profileImage);
        }

        const res = await fetch(`${BASE_URL}/users/update-profile`, {
            method: "PUT",
            headers: {
                Authorization: accessToken,
                // Do NOT set Content-Type for FormData, it will be handled by fetch
            },
            body: payload,
        });

        const result = await res.json();

        if (!res.ok || !result?.success) {
            return {
                success: false,
                message: result?.message || "Failed to update profile.",
            };
        }

        revalidatePath("/admin/dashboard/settings");

        return {
            success: true,
            message: result?.message || "Profile updated successfully.",
            data: result?.data,
        };
    } catch (error) {
        console.error("Update profile failed:", error);
        return {
            success: false,
            message: "Something went wrong while updating your profile.",
        };
    }
}
