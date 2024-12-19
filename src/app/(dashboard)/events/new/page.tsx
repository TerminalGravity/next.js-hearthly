import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CreateEventForm } from "@/components/events/create-event-form";

export default async function NewEventPage() {
  const user = await getCurrentUser();

  // Get user's families
  const families = await prisma.family.findMany({
    where: {
      members: {
        some: {
          userId: user?.id,
        },
      },
    },
  });

  if (!families.length) {
    notFound();
  }

  // For now, we'll use the first family. In a real app, you might want to
  // add family selection or get the family ID from the URL/query params
  const familyId = families[0].id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="mt-2 text-muted-foreground">
          Schedule a new event for your family
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border p-4">
          <CreateEventForm familyId={familyId} />
        </div>
      </div>
    </div>
  );
} 