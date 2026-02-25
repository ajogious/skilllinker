import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params; // ✅ awaited

    const profile = await prisma.tradesmanProfile.findUnique({
      where: { userId: id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Tradesman profile not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.tradesmanProfile.update({
      where: { userId: id },
      data: { isVerified: !profile.isVerified },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        message: updated.isVerified
          ? "🎉 Your profile has been verified by SkillLinker!"
          : "Your verification status has been removed.",
      },
    });

    return NextResponse.json({
      isVerified: updated.isVerified,
      message: updated.isVerified
        ? "Tradesman verified"
        : "Verification removed",
    });
  } catch (error) {
    console.error("Verify toggle error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
