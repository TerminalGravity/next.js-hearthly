import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  return {
    session,
    status,
    update,
    isLoading,
    isAuthenticated,
    user: session?.user,
  };
} 