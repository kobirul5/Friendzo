import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type Params = {
  params: Promise<{
    interestId: string;
  }>;
};

export async function PUT(request: Request, context: Params) {
  const { interestId } = await context.params;
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
    const res = await fetch(`${BASE_URL}/admin/interest/${interestId}`, {
      method: "PUT",
      headers: {
        Authorization: accessToken,
      },
      body: formData,
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to update admin interest:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update interest.", data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Params) {
  const { interestId } = await context.params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/interest/${interestId}`, {
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
    console.error("Failed to delete admin interest:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete interest.", data: null },
      { status: 500 }
    );
  }
}
