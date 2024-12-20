import { useState } from "react";

interface InviteMemberFormProps {
  familyId: string;
  onInviteSent?: () => void;
}

export default function InviteMemberForm({
  familyId,
  onInviteSent,
}: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInviteLink("");

    try {
      const response = await fetch(`/api/families/${familyId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setInviteLink(data.inviteLink);
      setEmail("");
      onInviteSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter email address"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Invitation"}
        </button>
      </form>

      {inviteLink && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            Invitation sent! Share this link with the invitee:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}${inviteLink}`}
              className="flex-1 p-2 text-sm bg-white border rounded"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}${inviteLink}`
                );
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 