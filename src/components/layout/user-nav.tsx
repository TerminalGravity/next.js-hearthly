import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        {user?.name}
      </div>
      <Button
        variant="ghost"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  );
} 