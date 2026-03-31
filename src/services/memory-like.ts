/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type LikeUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function likeMemory(memoryId: string): Promise<any> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/likes/memories`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoryId }),
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return { success: false, message: result?.message || "Failed to like memory." };
    }

    revalidatePath("/");

    return { success: true, message: result?.message || "Like added." };
  } catch (error) {
    console.error("Like memory failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}

export async function unlikeMemory(memoryId: string): Promise<any> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/likes/memories`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoryId }),
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return { success: false, message: result?.message || "Failed to remove like." };
    }

    revalidatePath("/");

    return { success: true, message: result?.message || "Like removed." };
  } catch (error) {
    console.error("Unlike memory failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}

export async function getMemoryLikeStats(memoryId: string): Promise<{
  success: boolean;
  message?: string;
  likeCount?: number;
  likedBy?: LikeUser[];
}> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/likes/memories/${memoryId}`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return { success: false, message: result?.message || "Failed to load like details." };
    }

    return {
      success: true,
      likeCount: result?.data?.likeCount || 0,
      likedBy: Array.isArray(result?.data?.likedBy) ? result.data.likedBy : [],
    };
  } catch (error) {
    console.error("Get memory like stats failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}
