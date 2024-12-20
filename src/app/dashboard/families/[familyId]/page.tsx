import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import InviteMemberForm from "@/components/family/InviteMemberForm";
import FamilyMembersList from "@/components/family/FamilyMembersList";

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
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!family) return null;

  // Check if current user is a member of this family
  const isMember = family.members.some(
    (member) => member.user.email === session.user.email
  );

  if (!isMember) return null;

  return family;
}

export default async function FamilyDashboardPage({ params }: PageProps) {
  const family = await getFamilyData(params.familyId);

  if (!family) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Family Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {family.familyName}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your family members and settings
          </p>
        </div>

        {/* Members Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Family Members
              </h2>
            </div>

            <Suspense
              fallback={
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              }
            >
              <FamilyMembersList members={family.members} />
            </Suspense>
          </div>
        </div>

        {/* Invite Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Invite New Members
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Send invitations to family members to join your family group.
              </p>
            </div>

            <InviteMemberForm familyId={family.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 