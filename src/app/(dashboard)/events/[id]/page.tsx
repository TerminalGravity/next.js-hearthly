import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RsvpButton } from "@/components/events/rsvp-button";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { isUserFamilyAdmin } from "@/lib/auth/permissions";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const user = await getCurrentUser();
  const eventId = params.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      family: true,
      rsvps: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Check if user is a member of the family
  const membership = await prisma.familyMember.findFirst({
    where: {
      familyId: event.familyId,
      userId: user?.id,
    },
  });

  if (!membership) {
    notFound();
  }

  // Check if user is admin
  const isAdmin = await isUserFamilyAdmin(event.familyId);

  // Get current user's RSVP
  const userRsvp = event.rsvps.find((rsvp) => rsvp.userId === user?.id);

  // Group RSVPs by status
  const rsvpGroups = event.rsvps.reduce(
    (acc, rsvp) => {
      acc[rsvp.status].push(rsvp);
      return acc;
    },
    {
      YES: [],
      NO: [],
      MAYBE: [],
    } as Record<string, typeof event.rsvps>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="mt-2 text-muted-foreground">
            Hosted by {event.host}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-4">
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline">Edit Event</Button>
            </Link>
            <form action={`/api/events/${event.id}/delete`}>
              <Button variant="destructive" type="submit">
                Delete Event
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <dl className="mt-4 space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Time</dt>
                <dd>{event.time}</dd>
              </div>
              {event.description && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd>{event.description}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Your RSVP</h2>
            <div className="mt-4">
              <RsvpButton
                eventId={event.id}
                currentStatus={userRsvp?.status}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Guest List</h2>
            <div className="mt-4 space-y-4">
              {Object.entries(rsvpGroups).map(([status, rsvps]) => (
                <div key={status}>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {status} ({rsvps.length})
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {rsvps.map((rsvp) => (
                      <li key={rsvp.id} className="text-sm">
                        {rsvp.user.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 