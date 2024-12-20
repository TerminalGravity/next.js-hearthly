import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { isUserFamilyMember } from "@/lib/auth/permissions";

const rsvpSchema = z.object({
  status: z.enum(["YES", "NO", "MAYBE"]),
});

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the family
    const isMember = await isUserFamilyMember(event.familyId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a family member to RSVP" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = rsvpSchema.parse(body);

    // Get or create user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || "",
        hashedPassword: "", // We don't need this for OAuth
      },
    });

    // Create or update RSVP
    const rsvp = await prisma.rsvp.upsert({
      where: {
        eventId_userId: {
          eventId: params.eventId,
          userId: user.id,
        },
      },
      update: {
        status: validatedData.status,
      },
      create: {
        eventId: params.eventId,
        userId: user.id,
        status: validatedData.status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the family
    const isMember = await isUserFamilyMember(event.familyId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a family member to view RSVPs" },
        { status: 403 }
      );
    }

    const rsvps = await prisma.rsvp.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rsvps);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 