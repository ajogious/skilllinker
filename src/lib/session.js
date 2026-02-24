import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Use in server components to get session
export async function getSession() {
  const session = await auth();
  return session;
}

// Use in server components that require login
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

// Use in server components that require a specific role
export async function requireRole(role) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== role) {
    redirect("/unauthorized");
  }
  return session;
}
