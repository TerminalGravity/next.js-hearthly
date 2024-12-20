import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/events/calendar-view";
import { format } from "date-fns";

export default async function EventsPage() {
  const user = await getCurrentUser();

  const events = await prisma.event.findMany({
    where: {
      family: {
        members: {
          some: {
            userId: user?.id,
          },
        },
      },
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      family: true,
      rsvps: {
        where: {
          userId: user?.id,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your family events
          </p>
        </div>
        <Link href="/events/new">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="space-y-8">
        <CalendarView
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            host: event.host,
          }))}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="divide-y rounded-lg border">
            {events.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No upcoming events
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/events/${event.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.date), "EEEE, MMMM d, yyyy")} at{" "}
                      {event.time}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Hosted by {event.host}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      {event.rsvps[0]?.status || "Not responded"}
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 