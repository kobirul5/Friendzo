import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(`${BASE_URL}/admin/interest`, {
      headers: accessToken
        ? {
            Authorization: accessToken,
            "Content-Type": "application/json",
          }
        : undefined,
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to load admin interests:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load interests.", data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/admin/interest`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
      },
      body: formData,
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to create admin interest:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create interest.", data: null },
      { status: 500 }
    );
  }
}
