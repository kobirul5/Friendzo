/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function toggleEventLike(eventId: string): Promise<{
  success: boolean;
  message?: string;
  liked?: boolean;
  likeCount?: number;
}> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/events/${eventId}/like`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return { success: false, message: result?.message || "Failed to toggle like." };
    }

    revalidatePath("/events");
    revalidatePath("/");

    return {
      success: true,
      message: result?.message || "Like toggled.",
      liked: result?.data?.liked,
      likeCount: result?.data?.likeCount,
    };
  } catch (error) {
    console.error("Toggle event like failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}
