import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.tradesmanProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// PUT /api/tradesman/profile — update own profile
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TRADESMAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bio, skills, yearsExperience, location, avatar, name } = body;

    // Update user fields
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    // Update tradesman profile
    const profile = await prisma.tradesmanProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }),
        ...(yearsExperience !== undefined && {
          yearsExperience: parseInt(yearsExperience),
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
