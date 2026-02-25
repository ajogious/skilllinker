import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validate, sanitize, isValidEmail } from "@/lib/validate";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, location } = body;

    // Sanitize inputs
    const cleanName = sanitize(name || "");
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanLocation = sanitize(location || "");

    // Validate
    const validationError = validate({
      name: cleanName,
      email: cleanEmail,
      password,
    });
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: 400 },
      );
    }

    if (!["CLIENT", "TRADESMAN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 },
      );
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password with cost factor 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role,
        location: cleanLocation || null,
      },
    });

    // Auto-create tradesman profile
    if (role === "TRADESMAN") {
      await prisma.tradesmanProfile.create({
        data: { userId: user.id, skills: [], yearsExperience: 0 },
      });
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
