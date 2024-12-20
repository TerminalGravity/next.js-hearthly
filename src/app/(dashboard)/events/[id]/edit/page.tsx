import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditEventForm } from "@/components/events/edit-event-form";
import { isUserFamilyAdmin } from "@/lib/auth/permissions";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const user = await getCurrentUser();
  const eventId = params.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      family: true,
    },
  });

  if (!event) {
    notFound();
  }

  // Check if user is admin
  const isAdmin = await isUserFamilyAdmin(event.familyId);
  if (!isAdmin) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="mt-2 text-muted-foreground">
          Update the event details
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border p-4">
          <EditEventForm event={event} />
        </div>
      </div>
    </div>
  );
} 