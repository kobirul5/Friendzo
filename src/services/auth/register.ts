/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import z from "zod";
import { parse } from "cookie";
import { cookies } from "next/headers";

const registerValidationZodSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    firstName: z.string().min(2, "First Name must be at least 2 characters").max(32, "First Name must be at most 32 characters"),
    lastName: z.string().min(2, "Last Name must be at least 2 characters").max(32, "Last Name must be at most 32 characters").optional().or(z.literal("")),
    phoneNumber: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
    age: z.string().optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters").max(32, "Password must be at most 32 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters").max(32, "Password must be at most 32 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const registerUser = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const rawData = {
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phoneNumber: formData.get("phoneNumber"),
            address: formData.get("address"),
            gender: formData.get("gender"),
            age: formData.get("age"),
        };

        const validatedField = registerValidationZodSchema.safeParse(rawData);

        if (!validatedField.success) {
            return {
                success: false,
                errors: validatedField.error.issues.map((issue) => {
                    return {
                        field: issue.path[0],
                        message: issue.message
                    }
                }),
            }
        }

        const payload = {
            email: rawData.email,
            password: rawData.password,
            firstName: rawData.firstName,
            lastName: rawData.lastName,
            phoneNumber: rawData.phoneNumber,
            address: rawData.address,
            gender: rawData.gender || undefined,
            age: rawData.age ? parseInt(rawData.age as string) : undefined,
        };

        const res = await fetch("http://localhost:5000/api/v1/users/register", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            }
        });

        const result = await res.json();

        if (!result.success) {
            return result;
        }

        // Handle cookies for session persistence
        const cookieHeader = res.headers.getSetCookie();
        const cookieStore = await cookies();

        if (cookieHeader && cookieHeader.length > 0) {
            cookieHeader.forEach((cookie) => {
                const parsedCookie = parse(cookie);
                const cookieName = Object.keys(parsedCookie)[0];
                const cookieValue = parsedCookie[cookieName];

                if ((cookieName === "accessToken" || cookieName === "refreshToken") && cookieValue) {
                    cookieStore.set(cookieName as string, cookieValue, {
                        httpOnly: true,
                        path: parsedCookie.path || "/",
                        maxAge: parsedCookie['Max-Age'] ? parseInt(parsedCookie['Max-Age']) : undefined,
                        expires: parsedCookie.expires ? new Date(parsedCookie.expires) : undefined,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: (parsedCookie.sameSite as any) || "lax",
                    });
                }
            })
        }

        return result;

    } catch (error) {
        console.error("User registration failed", error);
        return { success: false, message: "Internal server error" };
    }
}
