import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isUserFamilyMember } from "@/lib/auth/permissions";
import { sendEmail, generateCommentNotificationEmail } from "@/lib/email/email.service";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
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
        { error: "You must be a family member to comment" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = commentSchema.parse(body);

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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        eventId: params.eventId,
        userId: user.id,
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

    // Send email notifications to all family members except the commenter
    const familyEmails = event.family.members
      .map((member: FamilyMember) => member.user.email)
      .filter((email: string) => email !== session.user.email);

    const { subject, html } = generateCommentNotificationEmail(
      event.title,
      session.user.name || session.user.email,
      validatedData.content
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error handling comment:", error);
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
        { error: "You must be a family member to view comments" },
        { status: 403 }
      );
    }

    const comments = await prisma.comment.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 