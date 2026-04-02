import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  const { userId } = await context.params;

  try {
    const body = await request.json();
    const res = await fetch(`${BASE_URL}/dashboard/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: body?.status,
      }),
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to update admin user status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user status.", data: null },
      { status: 500 }
    );
  }
}
