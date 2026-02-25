import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TRANSITIONS = {
  accept: { from: ["OPEN"], to: "ACCEPTED", role: "TRADESMAN" },
  decline: { from: ["ACCEPTED"], to: "OPEN", role: "TRADESMAN" },
  start: { from: ["ACCEPTED"], to: "IN_PROGRESS", role: "TRADESMAN" },
  complete: { from: ["IN_PROGRESS"], to: "COMPLETED", role: "TRADESMAN" },
  cancel: {
    from: ["OPEN", "ACCEPTED", "IN_PROGRESS"],
    to: "CANCELLED",
    role: "CLIENT",
  },
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (!TRANSITIONS[action]) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const transition = TRANSITIONS[action];
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
        tradesman: { select: { name: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (
      session.user.role !== transition.role &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: `Only a ${transition.role} can perform this action` },
        { status: 403 },
      );
    }

    if (transition.role === "CLIENT" && job.clientId !== session.user.id) {
      return NextResponse.json({ error: "Not your job" }, { status: 403 });
    }
    if (
      transition.role === "TRADESMAN" &&
      action !== "accept" &&
      job.tradesmanId !== session.user.id
    ) {
      return NextResponse.json({ error: "Not your job" }, { status: 403 });
    }

    if (!transition.from.includes(job.status)) {
      return NextResponse.json(
        { error: `Cannot ${action} a job with status: ${job.status}` },
        { status: 400 },
      );
    }

    const updateData = { status: transition.to };
    if (action === "accept") updateData.tradesmanId = session.user.id;
    if (action === "decline") updateData.tradesmanId = null;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        tradesman: { select: { id: true, name: true } },
      },
    });

    const notifyUserId =
      transition.role === "TRADESMAN"
        ? updatedJob.client.id
        : updatedJob.tradesmanId;

    const notificationMessages = {
      accept: `${session.user.name} accepted your job: "${job.title}"`,
      decline: `${session.user.name} declined job: "${job.title}" — it's open again`,
      start: `${session.user.name} has started work on: "${job.title}"`,
      complete: `${session.user.name} marked "${job.title}" as completed. Please leave a review!`,
      cancel: `Job "${job.title}" was cancelled by the client.`,
    };

    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          jobId: job.id,
          message: notificationMessages[action],
        },
      });
    }

    return NextResponse.json({
      job: updatedJob,
      message: `Job ${transition.to.toLowerCase().replace("_", " ")} successfully`,
    });
  } catch (error) {
    console.error("Status transition error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
