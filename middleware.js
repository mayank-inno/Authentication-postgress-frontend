import { NextResponse } from "next/server"

const middleware = (req) => {
    const token = req.cookies.get("token")?.value;
    const url = req.nextUrl.pathname;
    const authPages = ["/login", "/signup", "/reset-password"];

    // if no tooken and no auth page then redirect to login
    if (!token && !authPages.includes(url)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    // if tokken and also a public page then let go req
    if (token && authPages.includes(url)) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"]
};