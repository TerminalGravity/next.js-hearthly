import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { isUserFamilyAdmin } from "@/lib/auth/permissions";

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