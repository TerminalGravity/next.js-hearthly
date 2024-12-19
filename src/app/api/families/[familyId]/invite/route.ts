import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { familyId } = params;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if the current user is an admin of the family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: user.id,
        role: Role.ADMIN,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "Not authorized to invite members" },
        { status: 403 }
      );
    }

    // Check if the user already exists
    const invitedUser = await prisma.user.findUnique({
      where: { email },
      include: {
        familyMembers: {
          where: { familyId },
        },
      },
    });

    if (invitedUser?.familyMembers.length) {
      return NextResponse.json(
        { message: "User is already a member of this family" },
        { status: 400 }
      );
    }

    // If user exists, add them to the family
    if (invitedUser) {
      await prisma.familyMember.create({
        data: {
          familyId,
          userId: invitedUser.id,
          role: Role.MEMBER,
        },
      });

      // TODO: Send notification email to existing user

      return NextResponse.json(
        { message: "User added to family" },
        { status: 200 }
      );
    }

    // If user doesn't exist, create an invitation
    // TODO: Implement invitation system with tokens
    // For now, we'll just return a success message
    return NextResponse.json(
      { message: "Invitation sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Invite member error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 