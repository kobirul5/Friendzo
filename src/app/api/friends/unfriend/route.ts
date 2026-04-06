import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const friendId = typeof body?.friendId === "string" ? body.friendId : "";

    if (!friendId) {
      return NextResponse.json(
        { success: false, message: "Friend id is required.", data: null },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/follow/unfriend`, {
      method: "PUT",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId }),
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to unfriend user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unfriend user.", data: null },
      { status: 500 }
    );
  }
}
