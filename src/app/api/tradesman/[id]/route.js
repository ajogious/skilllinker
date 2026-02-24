import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const profile = await prisma.tradesmanProfile.findFirst({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            location: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Tradesman not found" },
        { status: 404 },
      );
    }

    // Get their reviews
    const reviews = await prisma.review.findMany({
      where: { tradesmanId: id },
      include: {
        client: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get completed jobs count
    const completedJobs = await prisma.job.count({
      where: { tradesmanId: id, status: "COMPLETED" },
    });

    return NextResponse.json({ profile, reviews, completedJobs });
  } catch (error) {
    console.error("Get tradesman error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
