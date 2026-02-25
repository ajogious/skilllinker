import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            email: true,
          },
        },
        tradesman: {
          select: { id: true, name: true, avatar: true, location: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        review: {
          include: {
            client: { select: { name: true } },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const canView =
      session.user.role === "ADMIN" ||
      job.clientId === session.user.id ||
      job.tradesmanId === session.user.id ||
      (session.user.role === "TRADESMAN" && job.status === "OPEN");

    if (!canView) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// DELETE /api/jobs/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.clientId !== session.user.id) {
      return NextResponse.json({ error: "Not your job" }, { status: 403 });
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "Only open jobs can be cancelled" },
        { status: 400 },
      );
    }

    await prisma.job.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Job cancelled" });
  } catch (error) {
    console.error("Cancel job error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
