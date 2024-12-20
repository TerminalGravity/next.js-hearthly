import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { routes } from "@/lib/routes";

interface Event {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  description?: string;
  rsvps: Array<{
    status: "YES" | "NO" | "MAYBE";
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface EventListProps {
  familyId: string;
}

export default function EventList({ familyId }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(`/api/families/${familyId}/events`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch events");
        }

        setEvents(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [familyId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <Link
          key={event.id}
          href={routes.events.detail(event.id)}
          className="block"
        >
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500">Hosted by {event.host}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(event.date), "MMM d, yyyy")}
                </p>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
            </div>

            {event.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {event.rsvps
                    .filter((rsvp) => rsvp.status === "YES")
                    .slice(0, 3)
                    .map((rsvp) => (
                      <div
                        key={rsvp.user.id}
                        className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white"
                      >
                        <span className="text-sm font-medium text-gray-600">
                          {rsvp.user.name?.[0] || "?"}
                        </span>
                      </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500">
                  {event.rsvps.filter((rsvp) => rsvp.status === "YES").length}{" "}
                  attending
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 