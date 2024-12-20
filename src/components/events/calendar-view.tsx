import { useState } from "react";
import { Card } from "@tremor/react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  host: string;
}

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getDayEvents = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button onClick={previousMonth} variant="outline" size="sm">
            Previous
          </Button>
          <Button onClick={nextMonth} variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24 rounded-lg border bg-muted/50" />
        ))}

        {days.map((day) => {
          const dayEvents = getDayEvents(day);
          return (
            <div
              key={day.toISOString()}
              className={`h-24 rounded-lg border p-1 ${
                isSameMonth(day, currentDate)
                  ? "bg-background"
                  : "bg-muted/50"
              }`}
            >
              <div className="text-right text-sm">
                {format(day, "d")}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block truncate rounded bg-primary/10 px-1 py-0.5 text-xs text-primary hover:bg-primary/20"
                  >
                    {format(new Date(`${event.date}T${event.time}`), "HH:mm")} -{" "}
                    {event.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
} 