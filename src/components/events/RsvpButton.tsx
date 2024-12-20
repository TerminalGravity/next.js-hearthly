import { useState } from "react";
import { useSession } from "next-auth/react";

interface RsvpButtonProps {
  eventId: string;
  initialStatus?: "YES" | "NO" | "MAYBE";
  onRsvpChange?: (status: "YES" | "NO" | "MAYBE") => void;
}

export default function RsvpButton({
  eventId,
  initialStatus,
  onRsvpChange,
}: RsvpButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"YES" | "NO" | "MAYBE" | undefined>(
    initialStatus
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRsvp = async (newStatus: "YES" | "NO" | "MAYBE") => {
    if (!session?.user?.email) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update RSVP");
      }

      setStatus(newStatus);
      onRsvpChange?.(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleRsvp("YES")}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            status === "YES"
              ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
          }`}
        >
          Going
        </button>
        <button
          onClick={() => handleRsvp("MAYBE")}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            status === "MAYBE"
              ? "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
          }`}
        >
          Maybe
        </button>
        <button
          onClick={() => handleRsvp("NO")}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            status === "NO"
              ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
          }`}
        >
          Can't Go
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
} 