/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export type MemoryCommentUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
};

export type MemoryComment = {
  id: string;
  content: string;
  userId?: string;
  memoryId?: string;
  createdAt?: string;
  user?: MemoryCommentUser;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function getMemoryComments(memoryId: string): Promise<{
  success: boolean;
  comments?: MemoryComment[];
  message?: string;
}> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/comment/${memoryId}`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to load comments.",
      };
    }

    return {
      success: true,
      comments: Array.isArray(result?.data) ? result.data : [],
    };
  } catch (error) {
    console.error("Get memory comments failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}

export async function createMemoryComment(memoryId: string, comment: string): Promise<any> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/comment`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memoryId, comment }),
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to add comment.",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: result?.message || "Comment added successfully.",
      comment: result?.data,
    };
  } catch (error) {
    console.error("Create memory comment failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}

export async function deleteMemoryComment(commentId: string): Promise<any> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  try {
    const res = await fetch(`${BASE_URL}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to delete comment.",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: result?.message || "Comment deleted successfully.",
    };
  } catch (error) {
    console.error("Delete memory comment failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}
