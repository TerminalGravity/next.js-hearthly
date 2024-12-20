import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = inviteSchema.parse(body);

    // Check if user is admin of the family
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: params.familyId,
        user: {
          email: session.user.email,
        },
        role: "ADMIN",
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "Only family admins can send invites" },
        { status: 403 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create or update invitation
    const invitation = await prisma.invitation.upsert({
      where: {
        familyId_email: {
          familyId: params.familyId,
          email: validatedData.email,
        },
      },
      update: {
        token,
        expiresAt,
      },
      create: {
        familyId: params.familyId,
        email: validatedData.email,
        token,
        expiresAt,
      },
    });

    // TODO: Send invitation email
    // For now, return the token that would be sent in the email
    return NextResponse.json({
      message: "Invitation sent successfully",
      inviteLink: `/invite?token=${token}`,
    });
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