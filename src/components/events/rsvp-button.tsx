import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RsvpStatus } from "@prisma/client";

interface RsvpButtonProps {
  eventId: string;
  currentStatus?: RsvpStatus | null;
}

export function RsvpButton({ eventId, currentStatus }: RsvpButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateRsvp(status: RsvpStatus) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update RSVP");
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={currentStatus === RsvpStatus.YES ? "default" : "outline"}
          onClick={() => updateRsvp(RsvpStatus.YES)}
          disabled={isLoading}
          size="sm"
        >
          Yes
        </Button>
        <Button
          variant={currentStatus === RsvpStatus.NO ? "default" : "outline"}
          onClick={() => updateRsvp(RsvpStatus.NO)}
          disabled={isLoading}
          size="sm"
        >
          No
        </Button>
        <Button
          variant={currentStatus === RsvpStatus.MAYBE ? "default" : "outline"}
          onClick={() => updateRsvp(RsvpStatus.MAYBE)}
          disabled={isLoading}
          size="sm"
        >
          Maybe
        </Button>
      </div>
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 