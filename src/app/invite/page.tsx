import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

interface PageProps {
  searchParams: {
    token?: string;
  };
}

async function getInvitationData(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      family: true,
    },
  });

  if (!invitation) return null;
  if (invitation.expiresAt < new Date()) return null;

  return invitation;
}

export default async function InvitePage({ searchParams }: PageProps) {
  const session = await getServerSession();
  const token = searchParams.token;

  if (!token) {
    redirect("/dashboard");
  }

  if (!session?.user?.email) {
    redirect(`/api/auth/signin?callbackUrl=/invite?token=${token}`);
  }

  const invitation = await getInvitationData(token);

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid or Expired Invitation
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This invitation link is no longer valid. Please request a new
              invitation from your family admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invitation.email !== session.user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Wrong Email Address
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This invitation was sent to {invitation.email}. Please sign in with
              that email address to accept the invitation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Family Invitation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited to join {invitation.family.familyName}
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            
            const response = await fetch("/api/invite/accept", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            });

            if (response.ok) {
              redirect(`/dashboard/families/${invitation.familyId}`);
            }
          }}
        >
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Accept Invitation
          </button>
        </form>
      </div>
    </div>
  );
} 