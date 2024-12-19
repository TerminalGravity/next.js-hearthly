import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateFamilyForm } from "@/components/family/create-family-form";

export default async function FamilyPage() {
  const user = await getCurrentUser();

  const families = await prisma.family.findMany({
    where: {
      members: {
        some: {
          userId: user?.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Family Management</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Families</h2>
          {families.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium">No families yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a family to get started
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {families.map((family) => (
                <div
                  key={family.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <h3 className="font-medium">{family.familyName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {family.members.length} members
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link href={`/family/${family.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create New Family</h2>
          <div className="rounded-lg border p-4">
            <CreateFamilyForm />
          </div>
        </div>
      </div>
    </div>
  );
} 