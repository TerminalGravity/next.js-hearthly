import { Event, Rsvp } from "@/types/events";
import { format } from "date-fns";

export function formatEventDate(date: Date | string): string {
  return format(new Date(date), "EEEE, MMMM d, yyyy");
}

export function formatEventDateShort(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function groupRsvpsByStatus(rsvps: Rsvp[]): Record<string, Rsvp[]> {
  return rsvps.reduce(
    (acc, rsvp) => {
      acc[rsvp.status].push(rsvp);
      return acc;
    },
    {
      YES: [],
      NO: [],
      MAYBE: [],
    } as Record<string, Rsvp[]>
  );
}

export function getAttendeeCount(rsvps: Rsvp[]): number {
  return rsvps.filter((rsvp) => rsvp.status === "YES").length;
}

export function getEventSummary(event: Event): string {
  return `${formatEventDate(event.date)} at ${event.time}`;
}

export function getEventHost(event: Event): string {
  return `Hosted by ${event.host}`;
}

export function validateEventData(data: Partial<Event>): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!data.host?.trim()) {
    errors.push("Host is required");
  }

  if (!data.date) {
    errors.push("Date is required");
  } else if (new Date(data.date) < new Date()) {
    errors.push("Date must be in the future");
  }

  if (!data.time?.trim()) {
    errors.push("Time is required");
  }

  return errors;
} 