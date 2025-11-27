import { NextResponse } from "next/server"

const middleware = (req) => {
    const token = req.cookies.get("token")?.value;
    const url = req.nextUrl.pathname;
    const authPages = ["/login", "/signup", "/reset-password"];
    
    // If NO token and user is trying to access any protected page → redirect to login
    if (!token && !authPages.includes(url)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // If token exists but user tries to visit login/signup/reset → redirect home
    if (token && authPages.includes(url)) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
}

export default middleware;

export const config = {
    matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"]
};