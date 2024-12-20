import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Event } from "@/types/events";

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  return session;
}

export async function getEventWithAuth(eventId: string) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      family: {
        include: {
          members: {
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
      },
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
  const isMember = await prisma.familyMember.findFirst({
    where: {
      familyId: event.familyId,
      user: {
        email: session.user.email,
      },
    },
  });

  if (!isMember) {
    return NextResponse.json(
      { error: "You must be a family member to access this event" },
      { status: 403 }
    );
  }

  return { event, session };
}

export async function handleApiError(error: unknown) {
  console.error("API Error:", error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

export async function getOrCreateUser(email: string, name?: string | null) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: name || "",
      hashedPassword: "", // We don't need this for OAuth
    },
  });
}

export function excludeCurrentUser(emails: string[], currentUserEmail: string) {
  return emails.filter(email => email !== currentUserEmail);
} 