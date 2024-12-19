import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { familyName } = await req.json();

    if (!familyName) {
      return NextResponse.json(
        { message: "Family name is required" },
        { status: 400 }
      );
    }

    const family = await prisma.$transaction(async (tx) => {
      // Create the family
      const family = await tx.family.create({
        data: {
          familyName,
          adminUserId: user.id,
        },
      });

      // Add the creator as an admin member
      await tx.familyMember.create({
        data: {
          familyId: family.id,
          userId: user.id,
          role: Role.ADMIN,
        },
      });

      return family;
    });

    return NextResponse.json(
      {
        message: "Family created successfully",
        family,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create family error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 