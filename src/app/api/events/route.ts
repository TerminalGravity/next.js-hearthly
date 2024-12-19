import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, date, time, description, host, familyId } = await req.json();

    if (!title || !date || !time || !host || !familyId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user is a member of the family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Not authorized to create events for this family" },
        { status: 403 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        time,
        description,
        host,
        familyId,
      },
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 