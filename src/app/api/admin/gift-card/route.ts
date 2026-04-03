import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// GET /api/admin/gift-card - Get all gift cards
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: [] },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "ALL";

    const res = await fetch(`${BASE_URL}/admin/gift-card?type=${type}`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to proxy gift cards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load gift cards.", data: [] },
      { status: 500 }
    );
  }
}

// POST /api/admin/gift-card - Create new gift card
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const res = await fetch(`${BASE_URL}/admin/gift-card`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
      },
      body: formData,
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to create gift card:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create gift card." },
      { status: 500 }
    );
  }
}