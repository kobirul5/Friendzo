/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const createMemoryValidationSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  address: z.string().optional().or(z.literal("")),
  lat: z.string().min(1, "Latitude is required."),
  lng: z.string().min(1, "Longitude is required."),
});

export async function createMemory(_currentState: any, formData: FormData): Promise<any> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "Please login first.",
    };
  }

  const rawData = {
    description: String(formData.get("description") || ""),
    address: String(formData.get("address") || ""),
    lat: String(formData.get("lat") || ""),
    lng: String(formData.get("lng") || ""),
  };

  const image = formData.get("image");
  const validated = createMemoryValidationSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      })),
    };
  }

  if (!(image instanceof File) || image.size === 0) {
    return {
      success: false,
      errors: [{ field: "image", message: "Memory image is required." }],
    };
  }

  const payload = new FormData();
  payload.append("file", image);
  payload.append(
    "data",
    JSON.stringify({
      description: rawData.description,
      address: rawData.address || undefined,
      lat: rawData.lat,
      lng: rawData.lng,
    })
  );

  try {
    const res = await fetch(`${BASE_URL}/memories`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
      },
      body: payload,
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to create memory.",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: result?.message || "Memory created successfully.",
      data: result?.data,
    };
  } catch (error) {
    console.error("Create memory failed:", error);
    return {
      success: false,
      message: "Something went wrong while creating the memory.",
    };
  }
}
