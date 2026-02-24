import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body; // base64 string

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "skilllinker/avatars");

    const cloudRes = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!cloudRes.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const cloudData = await cloudRes.json();
    const avatarUrl = cloudData.secure_url;

    // Save to user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ url: avatarUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
