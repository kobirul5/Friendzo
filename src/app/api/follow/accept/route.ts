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
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Target user id is required.", data: null },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/follow/accept-or-decline`, {
      method: "PUT",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, action: "accept" }),
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to accept follow request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to accept follow request.", data: null },
      { status: 500 }
    );
  }
}
