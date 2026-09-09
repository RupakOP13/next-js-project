import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request:NextRequest){

    const token=await getToken({req:request})
    const url=request.nextUrl

    if (
        url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify")
    ) {
        return NextResponse.next()
    }

    if (token) {
        return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/sign-in",request.url))
}

export const config={
    matcher:['/sign-in',
             '/sign-up',
             '/home',
             '/',
             '/dashboard/:path*',
             '/verify/:path*',

    ]
}