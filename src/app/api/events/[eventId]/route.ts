import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { isUserFamilyMember, isUserFamilyAdmin } from "@/lib/auth/permissions";
import { sendEmail, generateEventUpdateEmail } from "@/lib/email/email.service";
import { format } from "date-fns";

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
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
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

    // Track changes for notification
    const changes: string[] = [];
    if (event.title !== validatedData.title) {
      changes.push(`Title changed from "${event.title}" to "${validatedData.title}"`);
    }
    if (event.host !== validatedData.host) {
      changes.push(`Host changed from "${event.host}" to "${validatedData.host}"`);
    }
    if (format(new Date(event.date), "yyyy-MM-dd") !== format(new Date(validatedData.date), "yyyy-MM-dd")) {
      changes.push(
        `Date changed from "${format(new Date(event.date), "MMMM d, yyyy")}" to "${format(new Date(validatedData.date), "MMMM d, yyyy")}"`
      );
    }
    if (event.time !== validatedData.time) {
      changes.push(`Time changed from "${event.time}" to "${validatedData.time}"`);
    }
    if (event.description !== validatedData.description) {
      changes.push("Description has been updated");
    }

    // Update event
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

    // If there are changes, send notifications
    if (changes.length > 0) {
      const familyEmails = event.family.members
        .map((member: FamilyMember) => member.user.email)
        .filter((email: string) => email !== session.user.email);

      const { subject, html } = generateEventUpdateEmail(
        updatedEvent.title,
        changes
      );

      await Promise.all(
        familyEmails.map((email: string) =>
          sendEmail({
            to: email,
            subject,
            html,
          })
        )
      );
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
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