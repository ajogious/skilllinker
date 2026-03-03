import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sanitize, sanitizeObject, validate } from "@/lib/validate";

// POST /api/jobs — client creates a job
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const raw = sanitizeObject({
      title: body.title || "",
      description: body.description || "",
      location: body.location || "",
    });
    const category = sanitize(body.category || "");
    const budget = body.budget;
    const tradesmanId = body.tradesmanId || null;

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    const validationError = validate({
      jobTitle: raw.title,
      jobDescription: raw.description,
      location: raw.location,
      budget,
    });
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: {
        title: raw.title,
        description: raw.description,
        category,
        location: raw.location,
        budget: budget ? parseFloat(budget) : null,
        clientId: session.user.id,
        status: "OPEN",
        ...(tradesmanId && { tradesmanId }),
      },
      include: {
        client: { select: { name: true, avatar: true } },
      },
    });

    // Create notification for tradesmen with matching skill (up to 20)
    const matchingTradesmen = await prisma.tradesmanProfile.findMany({
      where: { skills: { has: category } },
      select: { userId: true },
      take: 20,
    });

    if (matchingTradesmen.length > 0) {
      await prisma.notification.createMany({
        data: matchingTradesmen.map((t) => ({
          userId: t.userId,
          jobId: job.id,
          message: `New job in your skill area: "${raw.title}"`,
        })),
      });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// GET /api/jobs — list jobs (role-aware)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    let where = {};

    if (session.user.role === "CLIENT") {
      // Clients see their own jobs
      where.clientId = session.user.id;
    } else if (session.user.role === "TRADESMAN") {
      // Tradesmen see jobs assigned to them OR open jobs in their skills
      const profile = await prisma.tradesmanProfile.findUnique({
        where: { userId: session.user.id },
        select: { skills: true },
      });

      const mode = searchParams.get("mode"); // "mine" | "open"
      if (mode === "mine") {
        where.tradesmanId = session.user.id;
      } else if (mode === "open") {
        where = {
          status: "OPEN",
          tradesmanId: null,
          ...(profile?.skills?.length > 0 && {
            category: { in: profile.skills },
          }),
        };
      } else {
        // default: both
        where = {
          OR: [
            { tradesmanId: session.user.id },
            {
              status: "OPEN",
              tradesmanId: null,
              ...(profile?.skills?.length > 0 && {
                category: { in: profile.skills },
              }),
            },
          ],
        };
      }
    }

    // Optional filters
    if (status) where.status = status;
    if (category && session.user.role === "CLIENT") where.category = category;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, avatar: true, location: true },
        },
        tradesman: { select: { id: true, name: true, avatar: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
