import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  const upcomingEvents = await prisma.event.findMany({
    where: {
      family: {
        members: {
          some: {
            userId: user?.id,
          },
        },
      },
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/events/new">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium">No upcoming events</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create an event to get started
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hosted by {event.host}
                    </p>
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
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/family/invite">
              <Button variant="outline" className="w-full justify-start">
                Invite Family Members
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="outline" className="w-full justify-start">
                Browse Recipes
              </Button>
            </Link>
            <Link href="/games">
              <Button variant="outline" className="w-full justify-start">
                Browse Games
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 