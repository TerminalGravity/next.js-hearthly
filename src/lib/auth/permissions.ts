import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function getUserFamilyRole(familyId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const familyMember = await prisma.familyMember.findFirst({
    where: {
      familyId,
      user: {
        email: session.user.email,
      },
    },
  });

  return familyMember?.role || null;
}

export async function isUserFamilyAdmin(familyId: string) {
  const role = await getUserFamilyRole(familyId);
  return role === "ADMIN";
}

export async function isUserFamilyMember(familyId: string) {
  const role = await getUserFamilyRole(familyId);
  return role !== null;
}

export async function requireFamilyAdmin(familyId: string) {
  const isAdmin = await isUserFamilyAdmin(familyId);
  if (!isAdmin) {
    throw new Error("Only family admins can perform this action");
  }
}

export async function requireFamilyMember(familyId: string) {
  const isMember = await isUserFamilyMember(familyId);
  if (!isMember) {
    throw new Error("You must be a family member to perform this action");
  }
} 