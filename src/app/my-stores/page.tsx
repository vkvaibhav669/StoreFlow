
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Package2 } from "lucide-react";

export default function MyStoresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading..." : "Please sign in."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center">
          <Store className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl md:text-3xl">My Stores</CardTitle>
          <CardDescription className="text-center">
            This page will display information about your stores.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Content for the "My Stores" page is under construction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
