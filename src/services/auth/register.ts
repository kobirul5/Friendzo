/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import z from "zod";

const registerValidationZodSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    name: z.string().min(4, "Name must be at least 4 characters").max(32, "Name must be at most 32 characters"),
    address: z.string().optional(),
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
            name: formData.get("name"),
            address: formData.get("address"),
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
            firstName: rawData.name, // Mapping 'name' to 'firstName' as per IUser
        };

        const res = await fetch("http://localhost:5000/api/v1/user/register", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            }
        });

        const result = await res.json();
        return result;

    } catch (error) {
        console.error("User registration failed", error);
        return { success: false, message: "Internal server error" };
    }
}
