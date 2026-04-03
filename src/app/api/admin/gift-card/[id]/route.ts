import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// GET /api/admin/gift-card/[id] - Get single gift card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE_URL}/admin/gift-card/${id}`, {
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
    console.error("Failed to get gift card:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load gift card." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gift-card/[id] - Update gift card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const formData = await request.formData();

    const res = await fetch(`${BASE_URL}/admin/gift-card/${id}`, {
      method: "PUT",
      headers: {
        Authorization: accessToken,
      },
      body: formData,
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to update gift card:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update gift card." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gift-card/[id] - Delete gift card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE_URL}/admin/gift-card/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to delete gift card:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete gift card." },
      { status: 500 }
    );
  }
}