import React from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { Layout } from "@/src/components/Layout";
import { Button } from "@/src/components/ui/button";

export default function Profile() {
  const { user, signOut } = useAuth();
  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Perfil</h1>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Email</div>
        <div className="font-medium">{user?.email}</div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">User ID</div>
        <div className="font-mono text-sm">{user?.id}</div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    </div>
  );
}
