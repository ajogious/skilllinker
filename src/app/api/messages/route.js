import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages?jobId=xxx — fetch all messages for a job
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // Verify user has access to this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { clientId: true, tradesmanId: true, status: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const hasAccess =
      session.user.role === "ADMIN" ||
      job.clientId === session.user.id ||
      job.tradesmanId === session.user.id;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { jobId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// POST /api/messages — send a message
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, content } = body;

    if (!jobId || !content?.trim()) {
      return NextResponse.json(
        { error: "jobId and content are required" },
        { status: 400 },
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400 },
      );
    }

    // Verify access
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { clientId: true, tradesmanId: true, status: true, title: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot message on a cancelled job" },
        { status: 400 },
      );
    }

    const hasAccess =
      job.clientId === session.user.id || job.tradesmanId === session.user.id;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        jobId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // Notify the other party
    const recipientId =
      job.clientId === session.user.id ? job.tradesmanId : job.clientId;

    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          jobId,
          message: `New message from ${session.user.name} on "${job.title}"`,
        },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
