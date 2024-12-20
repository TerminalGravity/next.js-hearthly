import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { isUserFamilyMember, isUserFamilyAdmin } from "@/lib/auth/permissions";

const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  host: z.string().min(1, "Host is required"),
  date: z.string().datetime(),
  time: z.string(),
  description: z.string().optional(),
});

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
      include: {
        family: true,
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
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
        { error: "You must be a family member to view this event" },
        { status: 403 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Check if user is an admin of the family
    const isAdmin = await isUserFamilyAdmin(event.familyId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only family admins can update events" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateEventSchema.parse(body);

    const updatedEvent = await prisma.event.update({
      where: { id: params.eventId },
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      },
      include: {
        family: true,
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
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

export async function DELETE(
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

    // Check if user is an admin of the family
    const isAdmin = await isUserFamilyAdmin(event.familyId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only family admins can delete events" },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id: params.eventId },
    });

    return NextResponse.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 