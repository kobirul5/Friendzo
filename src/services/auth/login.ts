/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import z from "zod";
import {parse} from "cookie";
import { cookies } from "next/headers";

const loginValidationZodSchema = z.object({
    email: z.email({
        error: "Invalid email address",
    }),
    password: z.string().min(4, "Password must be at least 6 characters").max(32, "Password must be at most 32 characters"),
})

export const loginUser = async (_currentState: any, formData: any): Promise<any> => {

    let accessTokenObj: null | any= null;
    let refreshTokenObj: null | any = null;

    try {
        const loginData = {
            email: formData.get("email"),
            password: formData.get("password"),
        }

        const valiDatedField = loginValidationZodSchema.safeParse(loginData);
        if (!valiDatedField.success) {
           return {
            success: false,
            errors: valiDatedField.error.issues.map((issue) => {
                return {
                    field: issue.path[0],
                    message: issue.message
                }
            }),
           }
        }

        const res = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: {
                "Content-Type": "application/json",
            }
        })

        const result = await res.json()

        const cookieHeader = res.headers.getSetCookie();
        
        if(cookieHeader && cookieHeader.length > 0) {
            cookieHeader.forEach((cookie) => {
                const parsedCookie = parse(cookie);
                console.log(parsedCookie, "parsedCookie");
                if(parsedCookie['accessToken']) {
                    accessTokenObj = parsedCookie
                }
                if(parsedCookie['refreshToken']) {
                    refreshTokenObj = parsedCookie
                }
            })
        }else {
            throw new Error("No set cookie header found");
        }

        if(!accessTokenObj && !refreshTokenObj) {
            throw new Error("Access token or refresh token not found");
        }

        const  cookieStore = await cookies()

        console.log(cookieStore, "cookieStore");

        cookieStore.set("accessToken", accessTokenObj.accessToken, {
            httpOnly: true,
            path: accessTokenObj.path,
            maxAge: accessTokenObj['Max-Age'],
            expires: accessTokenObj.expires,
            secure: true,
            sameSite: accessTokenObj.sameSite,
        });
        cookieStore.set("refreshToken", refreshTokenObj.refreshToken, {
            httpOnly: true,
            path: refreshTokenObj.path,
            maxAge: refreshTokenObj.maxAge,
            expires: refreshTokenObj.expires,
            secure: true,
            sameSite: refreshTokenObj.sameSite,
        });

        

        return result

    } catch (error) {
        console.log(error, "User login failed");
    }
}

