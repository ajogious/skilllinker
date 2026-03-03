import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sanitize, validate } from "@/lib/validate";

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

// PUT /api/tradesman — update own profile
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TRADESMAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { skills, yearsExperience, avatar } = body;

    // Sanitize free-text fields
    const cleanName = body.name ? sanitize(body.name) : undefined;
    const cleanLocation =
      body.location !== undefined ? sanitize(body.location) : undefined;
    const cleanBio = body.bio !== undefined ? sanitize(body.bio) : undefined;

    // Validate only fields that were provided
    const fieldsToValidate = {};
    if (cleanName !== undefined) fieldsToValidate.name = cleanName;
    if (cleanLocation !== undefined) fieldsToValidate.location = cleanLocation;
    if (cleanBio !== undefined) fieldsToValidate.bio = cleanBio;

    if (Object.keys(fieldsToValidate).length > 0) {
      const validationError = validate(fieldsToValidate);
      if (validationError) {
        return NextResponse.json(
          { error: validationError.error },
          { status: 400 },
        );
      }
    }

    // Update user fields
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(cleanName !== undefined && { name: cleanName }),
        ...(cleanLocation !== undefined && { location: cleanLocation }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    // Update tradesman profile
    const profile = await prisma.tradesmanProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(cleanBio !== undefined && { bio: cleanBio }),
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
