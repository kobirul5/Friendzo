import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Unauthorized", data: null }, { status: 401 });
  }

  try {
    const tokenPayload = jwt.decode(accessToken);
    const decoded = tokenPayload && typeof tokenPayload !== "string"
      ? (tokenPayload as JwtPayload & { id?: string })
      : null;

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid token", data: null }, { status: 401 });
    }

    const res = await fetch(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to fetch user me:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load user data.", data: null },
      { status: 500 }
    );
  }
}
