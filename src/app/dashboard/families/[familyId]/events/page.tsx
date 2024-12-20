import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import EventList from "@/components/events/EventList";
import CreateEventForm from "@/components/events/CreateEventForm";
import { isUserFamilyMember } from "@/lib/auth/permissions";

interface PageProps {
  params: {
    familyId: string;
  };
}

async function getFamilyData(familyId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  if (!family) return null;

  // Check if current user is a member of this family
  const isMember = await isUserFamilyMember(familyId);
  if (!isMember) return null;

  return family;
}

export default async function EventsPage({ params }: PageProps) {
  const family = await getFamilyData(params.familyId);

  if (!family) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {family.familyName} Events
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View and manage family events
          </p>
        </div>

        {/* Create Event Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Event
          </h2>
          <CreateEventForm familyId={family.id} />
        </div>

        {/* Events List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Upcoming Events
          </h2>
          <Suspense
            fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            }
          >
            <EventList familyId={family.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 