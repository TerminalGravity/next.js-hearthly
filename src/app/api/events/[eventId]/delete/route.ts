import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { isUserFamilyAdmin } from "@/lib/auth/permissions";
import { sendEmail, generateEventDeletedEmail } from "@/lib/email/email.service";

interface FamilyMember {
  user: {
    email: string;
  };
}

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
    // Send email notifications to all family members except the one deleting the event
    const familyEmails = event.family.members
      .map((member: FamilyMember) => member.user.email)
      .filter((email: string) => email !== session.user.email);

    const { subject, html } = generateEventDeletedEmail(
      event.title,
      new Date(event.date)
    );

    await Promise.all([
      // Delete all RSVPs and comments first
      prisma.$transaction([
        prisma.rsvp.deleteMany({
          where: { eventId: params.eventId },
        }),
        prisma.comment.deleteMany({
          where: { eventId: params.eventId },
        }),
        prisma.event.delete({
          where: { id: params.eventId },
        }),
      ]),
      // Send notifications
      ...familyEmails.map((email: string) =>
        sendEmail({
          to: email,
          subject,
          html,
        })
      ),

    // Delete all RSVPs and comments first
    await prisma.$transaction([
      prisma.rsvp.deleteMany({
        where: { eventId: params.eventId },
      }),
      prisma.comment.deleteMany({
        where: { eventId: params.eventId },
      }),
      prisma.event.delete({
        where: { id: params.eventId },
      }),
    ]);

    return NextResponse.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 