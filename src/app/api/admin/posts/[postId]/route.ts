import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  const { postId } = await context.params;

  try {
    const res = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to delete admin post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete post.", data: null },
      { status: 500 }
    );
  }
}
