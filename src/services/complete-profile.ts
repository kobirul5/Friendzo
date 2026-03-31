/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const completeProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  about: z.string().min(10, "About must be at least 10 characters."),
  age: z.string().min(1, "Age is required."),
  gender: z.enum(["HIM", "HER", "EVERYONE"], {
    message: "Please select a gender.",
  }),
});

export async function completeProfile(_currentState: any, formData: FormData): Promise<any> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "Please login first.",
    };
  }

  const rawData = {
    firstName: String(formData.get("firstName") || ""),
    lastName: String(formData.get("lastName") || ""),
    phoneNumber: String(formData.get("phoneNumber") || ""),
    address: String(formData.get("address") || ""),
    about: String(formData.get("about") || ""),
    age: String(formData.get("age") || ""),
    gender: String(formData.get("gender") || ""),
  };

  const interests = formData
    .getAll("interests")
    .map((value) => String(value))
    .filter(Boolean);

  const profileImage = formData.get("profileImage");
  const validated = completeProfileSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      })),
    };
  }

  if (interests.length === 0) {
    return {
      success: false,
      errors: [{ field: "interests", message: "Select at least one interest." }],
    };
  }

  const payload = new FormData();

  if (profileImage instanceof File && profileImage.size > 0) {
    payload.append("images", profileImage);
  }

  payload.append(
    "data",
    JSON.stringify({
      firstName: rawData.firstName,
      lastName: rawData.lastName || undefined,
      phoneNumber: rawData.phoneNumber || undefined,
      address: rawData.address || undefined,
      about: rawData.about,
      age: Number(rawData.age),
      gender: rawData.gender,
      interests,
    })
  );

  try {
    const res = await fetch(`${BASE_URL}/users/update-profile`, {
      method: "PUT",
      headers: {
        Authorization: accessToken,
      },
      body: payload,
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Failed to complete profile.",
      };
    }

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      success: true,
      message: result?.message || "Profile completed successfully.",
      data: result?.data,
    };
  } catch (error) {
    console.error("Complete profile failed:", error);
    return {
      success: false,
      message: "Something went wrong while updating your profile.",
    };
  }
}
