import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Wraps an API handler with auth + role checks.
 * Usage:
 *   export const GET = withAuth(handler, "CLIENT")
 *   export const POST = withAuth(handler, ["CLIENT", "ADMIN"])
 */
export function withAuth(handler, requiredRole = null) {
  return async function (request, context) {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];
      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return handler(request, context, session);
  };
}

/**
 * Simple session check — returns session or throws 401 response
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
