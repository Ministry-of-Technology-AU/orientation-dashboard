import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid or missing JSON body" }, { status: 400 });
    }
    const { isOnboarded, isTourComplete, isInternational, petName, city, phoneNumber, interests, hasConfirmedInternationalGuidelines, organisationsLiked } = body;

    const updateData: any = {};
    if (typeof isOnboarded === "boolean") updateData.isOnboarded = isOnboarded;
    if (typeof isTourComplete === "boolean") updateData.isTourComplete = isTourComplete;
    if (typeof isInternational === "boolean") updateData.isInternational = isInternational;
    if (typeof hasConfirmedInternationalGuidelines === "boolean") updateData.hasConfirmedInternationalGuidelines = hasConfirmedInternationalGuidelines;
    if (typeof petName === "string") updateData.petName = petName;
    if (typeof city === "string") updateData.city = city;
    if (typeof phoneNumber === "string") updateData.phoneNumber = phoneNumber;
    // interests is a JSON object: { question1: string[], question2: string[] }
    if (interests !== undefined && interests !== null) updateData.interests = interests;
    if (organisationsLiked !== undefined && organisationsLiked !== null) updateData.organisationsLiked = organisationsLiked;

    // Set onboardedOn timestamp if onboarding is completed for the first time
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isOnboarded: true },
    });

    if (isOnboarded === true && (!existingUser || !existingUser.isOnboarded)) {
      updateData.onboardedOn = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
