import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.decode(accessToken) as { role?: string } | null;
    
    if (!decoded?.role) {
      return NextResponse.json(
        { success: false, message: "Role not found.", data: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User role retrieved successfully",
      data: { role: decoded.role }
    });
  } catch (error) {
    console.error("Failed to decode token:", error);
    return NextResponse.json(
      { success: false, message: "Invalid token.", data: null },
      { status: 401 }
    );
  }
}
