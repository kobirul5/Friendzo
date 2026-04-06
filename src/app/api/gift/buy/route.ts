import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
    const body = await request.json();
    const giftCardId = typeof body?.giftCardId === "string" ? body.giftCardId : "";
    const giftCategory = typeof body?.giftCategory === "string" ? body.giftCategory : "";

    if (!giftCardId || !giftCategory) {
      return NextResponse.json(
        { success: false, message: "Gift card ID and category are required.", data: null },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/gift/buy-gift-card`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ giftCardId, giftCategory }),
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to buy gift card:", error);
    return NextResponse.json(
      { success: false, message: "Failed to buy gift card.", data: null },
      { status: 500 }
    );
  }
}
