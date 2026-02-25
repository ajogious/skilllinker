import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

// GET /api/admin/users
export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        tradesmanProfile: {
          select: {
            isVerified: true,
            avgRating: true,
            totalReviews: true,
            skills: true,
          },
        },
        _count: {
          select: { clientJobs: true, tradesmanJobs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove passwords from response
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
