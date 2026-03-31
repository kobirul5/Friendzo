/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const createEventValidationSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters."),
  address: z.string().optional().or(z.literal("")),
  lat: z.string().min(1, "Latitude is required."),
  lng: z.string().min(1, "Longitude is required."),
  startedAt: z.string().min(1, "Event date and time are required."),
});

export async function createEvent(_currentState: any, formData: FormData): Promise<any> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "Please login first." };
  }

  const rawData = {
    description: String(formData.get("description") || ""),
    address: String(formData.get("address") || ""),
    lat: String(formData.get("lat") || ""),
    lng: String(formData.get("lng") || ""),
    startedAt: String(formData.get("startedAt") || ""),
  };

  const image = formData.get("image");
  const validated = createEventValidationSchema.safeParse(rawData);

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
      errors: [{ field: "image", message: "Event image is required." }],
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
      startedAt: rawData.startedAt,
    })
  );

  try {
    const res = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
      },
      body: payload,
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return { success: false, message: result?.message || "Failed to create event." };
    }

    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      message: result?.message || "Event created successfully.",
      data: result?.data,
    };
  } catch (error) {
    console.error("Create event failed:", error);
    return {
      success: false,
      message: "Something went wrong while creating the event.",
    };
  }
}
