import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InviteMemberForm } from "@/components/family/invite-member-form";
import { Role } from "@prisma/client";

interface FamilyPageProps {
  params: {
    id: string;
  };
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const user = await getCurrentUser();
  const familyId = params.id;

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!family) {
    notFound();
  }

  // Check if current user is a member
  const currentMember = family.members.find(
    (member) => member.userId === user?.id
  );

  if (!currentMember) {
    notFound();
  }

  const isAdmin = currentMember.role === Role.ADMIN;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{family.familyName}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your family members and settings
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Family Members</h2>
          <div className="divide-y rounded-lg border">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <h3 className="font-medium">{member.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {member.role === Role.ADMIN ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Invite Members</h2>
            <div className="rounded-lg border p-4">
              <InviteMemberForm familyId={family.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 