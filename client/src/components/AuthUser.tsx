import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/components/AuthProvider";
import { Button } from "@/src/components/ui/button";

export const AuthUser: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 bg-card/70 p-2 rounded-lg border">
      <Link
        to="/profile"
        className="text-sm text-muted-foreground hover:underline"
      >
        {user.email}
      </Link>
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        Logout
      </Button>
    </div>
  );
};

export default AuthUser;
