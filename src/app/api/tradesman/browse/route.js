import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tradesman/browse?skill=&location=&sort=&page=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill") || "";
    const location = searchParams.get("location") || "";
    const sort = searchParams.get("sort") || "rating"; // rating | newest | experience
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      user: {
        ...(location && {
          location: { contains: location, mode: "insensitive" },
        }),
      },
      ...(skill && {
        skills: { has: skill },
      }),
    };

    // Build sort
    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" }
        : sort === "experience"
          ? { yearsExperience: "desc" }
          : { avgRating: "desc" }; // default: rating

    const [tradesmen, total] = await Promise.all([
      prisma.tradesmanProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              location: true,
              avatar: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.tradesmanProfile.count({ where }),
    ]);

    return NextResponse.json({
      tradesmen,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Browse error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
