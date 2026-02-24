import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  const isClientRoute = nextUrl.pathname.startsWith("/client");
  const isTradesmanRoute = nextUrl.pathname.startsWith("/tradesman/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // If not logged in and trying to access protected routes → redirect to login
  if (!isLoggedIn && (isClientRoute || isTradesmanRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If logged in and trying to access auth pages → redirect to dashboard
  if (isLoggedIn && isAuthPage) {
    if (role === "CLIENT")
      return NextResponse.redirect(new URL("/client", nextUrl));
    if (role === "TRADESMAN")
      return NextResponse.redirect(new URL("/tradesman/dashboard", nextUrl));
    if (role === "ADMIN")
      return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // Role-based access control
  if (isLoggedIn) {
    if (isClientRoute && role !== "CLIENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
    if (isTradesmanRoute && role !== "TRADESMAN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/client/:path*",
    "/tradesman/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
