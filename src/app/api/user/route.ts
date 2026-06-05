import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isOnboarded, isTourComplete, isInternational, petName, city, phoneNumber } = body;

    const updateData: any = {};
    if (typeof isOnboarded === "boolean") updateData.isOnboarded = isOnboarded;
    if (typeof isTourComplete === "boolean") updateData.isTourComplete = isTourComplete;
    if (typeof isInternational === "boolean") updateData.isInternational = isInternational;
    if (typeof petName === "string") updateData.petName = petName;
    if (typeof city === "string") updateData.city = city;
    if (typeof phoneNumber === "string") updateData.phoneNumber = phoneNumber;

    // Set onboardedOn timestamp if onboarding is completed
    if (isOnboarded === true) {
      updateData.onboardedOn = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
