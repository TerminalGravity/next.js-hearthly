import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isUserFamilyMember } from "@/lib/auth/permissions";
import { sendEmail, generateRsvpNotificationEmail } from "@/lib/email/email.service";

const rsvpSchema = z.object({
  status: z.enum(["YES", "NO", "MAYBE"]),
});

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

    // Send email notifications to all family members except the one who RSVP'd
    const familyEmails = event.family.members
      .map((member: FamilyMember) => member.user.email)
      .filter((email: string) => email !== session.user.email);

    const { subject, html } = generateRsvpNotificationEmail(
      event.title,
      session.user.name || session.user.email,
      validatedData.status
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

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error("Error handling RSVP:", error);
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