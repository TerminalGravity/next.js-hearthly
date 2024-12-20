import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { isUserFamilyMember, isUserFamilyAdmin } from "@/lib/auth/permissions";

const createEventSchema = z.object({
  familyId: z.string(),
  title: z.string().min(1, "Title is required"),
  host: z.string().min(1, "Host is required"),
  date: z.string().datetime(),
  time: z.string(),
  description: z.string().optional(),
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
    const validatedData = createEventSchema.parse(body);

    // Check if user is a member of the family
    const isMember = await isUserFamilyMember(validatedData.familyId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a family member to create events" },
        { status: 403 }
      );
    }

    const event = await prisma.event.create({
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

    return NextResponse.json(event);
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json(
        { error: "Family ID is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the family
    const isMember = await isUserFamilyMember(familyId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a family member to view events" },
        { status: 403 }
      );
    }

    const events = await prisma.event.findMany({
      where: {
        familyId,
      },
      include: {
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
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 