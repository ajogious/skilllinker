import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sanitize, validate } from "@/lib/validate";

// POST /api/reviews — client submits a review after job completion
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, rating, comment } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 },
      );
    }

    const validationError = validate({ rating });
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: 400 },
      );
    }

    const cleanComment = comment ? sanitize(comment) : null;

    // Verify job exists, is completed, belongs to this client
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        clientId: true,
        tradesmanId: true,
        status: true,
        title: true,
        review: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.clientId !== session.user.id) {
      return NextResponse.json({ error: "Not your job" }, { status: 403 });
    }

    if (job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed jobs" },
        { status: 400 },
      );
    }

    if (job.review) {
      return NextResponse.json(
        { error: "You have already reviewed this job" },
        { status: 409 },
      );
    }

    if (!job.tradesmanId) {
      return NextResponse.json(
        { error: "No tradesman assigned to this job" },
        { status: 400 },
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        jobId,
        clientId: session.user.id,
        tradesmanId: job.tradesmanId,
        rating: parseInt(rating),
        comment: cleanComment,
      },
    });

    // Recalculate tradesman's average rating
    const allReviews = await prisma.review.findMany({
      where: { tradesmanId: job.tradesmanId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.tradesmanProfile.update({
      where: { userId: job.tradesmanId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10, // round to 1dp
        totalReviews: allReviews.length,
      },
    });

    // Notify tradesman
    await prisma.notification.create({
      data: {
        userId: job.tradesmanId,
        jobId,
        message: `You received a ${rating}-star review for "${job.title}"`,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
