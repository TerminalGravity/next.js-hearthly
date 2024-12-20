"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    host: string;
    date: Date;
    time: string;
    description?: string | null;
  };
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      host: formData.get("host") as string,
      date: new Date(formData.get("date") as string).toISOString(),
      time: formData.get("time") as string,
      description: formData.get("description") as string,
    };

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update event");
      }

      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Event Title
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={event.title}
          required
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="host" className="block text-sm font-medium mb-1">
          Host
        </label>
        <Input
          id="host"
          name="host"
          defaultValue={event.host}
          required
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <Input
          type="date"
          id="date"
          name="date"
          defaultValue={format(new Date(event.date), "yyyy-MM-dd")}
          required
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium mb-1">
          Time
        </label>
        <Input
          type="time"
          id="time"
          name="time"
          defaultValue={event.time}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optional)
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={event.description || ""}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
} 