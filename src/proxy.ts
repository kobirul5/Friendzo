import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';

const normalizeTokenRole = (role: unknown): UserRole | null => {
    if (role === "ADMIN") {
        return "ADMIN";
    }

    if (role === "USER") {
        return "USER";
    }

    return null;
}



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const cookieStore = await cookies()
    const pathname = request.nextUrl.pathname;

    const accessToken = request.cookies.get("accessToken")?.value || null;

    let userRole: UserRole | null = null;
    let isVerified: boolean | null = null;

    if (accessToken) {
        try {
            const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);

            if (typeof verifiedToken === "string") {
                cookieStore.delete("accessToken");
                cookieStore.delete("refreshToken");
                return NextResponse.redirect(new URL('/login', request.url));
            }

            userRole = normalizeTokenRole(verifiedToken.role);
            isVerified = verifiedToken.isVerified;

            if (!userRole) {
                cookieStore.delete("accessToken");
                cookieStore.delete("refreshToken");
                return NextResponse.redirect(new URL('/login', request.url));
            }
        } catch (error) {
            console.error("JWT Verification Error in proxy:", error);
            cookieStore.delete("accessToken");
            cookieStore.delete("refreshToken");
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    const isAuth = isAuthRoute(pathname)
    const routerOwner = getRouteOwner(pathname);

    if (!accessToken) {
        if (isAuth) {
            return NextResponse.next();
        }

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (!userRole) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule for unverified users
    if (isVerified === false && pathname !== "/verify-otp" && !isAuth) {
        return NextResponse.redirect(new URL('/verify-otp', request.url));
    }

    // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
    if (isAuth && userRole) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url))
    }

    // Rule 1.5 : Admin trying to access user home page. Redirect to admin dashboard
    if (userRole === "ADMIN" && pathname === "/") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    // No public routes for unauthenticated users; authenticated users can continue below.

    // Rule 3 : User is trying to access common protected route
    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    // Rule 4 : User is trying to access role based protected route
    if (routerOwner === "ADMIN" || routerOwner === "USER") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url))
        }
    }

    return NextResponse.next();
}



export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
}
