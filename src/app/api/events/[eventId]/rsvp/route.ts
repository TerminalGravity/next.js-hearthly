import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { RsvpStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { eventId } = params;
    const { status } = await req.json();

    if (!status || !Object.values(RsvpStatus).includes(status)) {
      return NextResponse.json(
        { message: "Invalid RSVP status" },
        { status: 400 }
      );
    }

    // Check if user is a member of the family that owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        family: {
          include: {
            members: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.family.members.length) {
      return NextResponse.json(
        { message: "Not authorized to RSVP to this event" },
        { status: 403 }
      );
    }

    // Upsert RSVP status
    const rsvp = await prisma.rsvp.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
      update: {
        status,
      },
      create: {
        eventId,
        userId: user.id,
        status,
      },
    });

    return NextResponse.json(
      {
        message: "RSVP updated successfully",
        rsvp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 