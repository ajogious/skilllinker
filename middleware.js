import NextAuth from "next-auth";
import authConfig from "./src/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  const isClientRoute = nextUrl.pathname.startsWith("/client");
  const isTradesmanRoute = nextUrl.pathname.startsWith("/tradesman");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (!isLoggedIn && (isClientRoute || isTradesmanRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && isAuthPage) {
    if (role === "CLIENT")
      return NextResponse.redirect(new URL("/client", nextUrl));
    if (role === "TRADESMAN")
      return NextResponse.redirect(new URL("/tradesman/dashboard", nextUrl));
    if (role === "ADMIN")
      return NextResponse.redirect(new URL("/admin", nextUrl));
  }

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
    "/tradesman/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
