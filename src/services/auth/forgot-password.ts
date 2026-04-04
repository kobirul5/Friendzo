/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { cookies } from "next/headers";
import { parse } from "cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const forgotPassword = async (email: string): Promise<any> => {
    try {
        const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: {
                "Content-Type": "application/json",
            }
        });

        return await res.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" };
    }
}

export const verifyOtp = async (email: string, otp: string): Promise<any> => {
    try {
        const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: "POST",
            body: JSON.stringify({ email, otp: Number(otp) }),
            headers: {
                "Content-Type": "application/json",
            }
        });

        const result = await res.json();

        if (result.success) {
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
        }

        return result;
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" };
    }
}

export const resetPassword = async (payload: any): Promise<any> => {
    try {
        const res = await fetch(`${BASE_URL}/auth/reset-password`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            }
        });

        return await res.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" };
    }
}
