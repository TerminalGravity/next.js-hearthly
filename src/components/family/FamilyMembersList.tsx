import { useSession } from "next-auth/react";
import Image from "next/image";

interface FamilyMember {
  id: string;
  role: "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  onRemoveMember?: (memberId: string) => void;
}

export default function FamilyMembersList({
  members,
  onRemoveMember,
}: FamilyMembersListProps) {
  const { data: session } = useSession();
  const currentUserIsAdmin = members.some(
    (member) =>
      member.user.email === session?.user?.email && member.role === "ADMIN"
  );

  return (
    <ul className="divide-y divide-gray-200">
      {members.map((member) => (
        <li
          key={member.id}
          className="py-4 flex items-center justify-between space-x-4"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {member.user.name ? (
                  <span className="text-xl font-medium text-gray-600">
                    {member.user.name[0]}
                  </span>
                ) : (
                  <span className="text-xl font-medium text-gray-600">?</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {member.user.name || "Unnamed Member"}
              </p>
              <p className="text-sm text-gray-500">{member.user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                member.role === "ADMIN"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {member.role}
            </span>
            {currentUserIsAdmin && onRemoveMember && member.role !== "ADMIN" && (
              <button
                onClick={() => onRemoveMember(member.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
} 