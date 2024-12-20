import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const acceptInviteSchema = z.object({
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = acceptInviteSchema.parse(body);

    // Find and validate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token: validatedData.token },
      include: { family: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation" },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    if (invitation.email !== session.user.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

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

    // Add user to family
    const familyMember = await prisma.familyMember.create({
      data: {
        familyId: invitation.familyId,
        userId: user.id,
        role: "MEMBER",
      },
      include: {
        family: true,
      },
    });

    // Delete the used invitation
    await prisma.invitation.delete({
      where: { token: validatedData.token },
    });

    return NextResponse.json({
      message: "Successfully joined family",
      familyMember,
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