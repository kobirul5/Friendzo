/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const getProfile = async (userId: string, options?: { revalidate?: number }): Promise<any> => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const revalidate = options?.revalidate ?? 60;

    try {
        const res = await fetch(`${BASE_URL}/users/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `${accessToken}`,
                "Content-Type": "application/json",
            },
            next: { revalidate }
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || "Failed to fetch profile");
        }

        return result.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}
