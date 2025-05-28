
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getStoreById } from "@/lib/data";
import type { StoreItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package2, Store as StoreIcon, Settings, ShoppingCart, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";


export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = React.useState<StoreItem | null>(null);
  const [loadingStore, setLoadingStore] = React.useState(true);
  
  const storeId = typeof params.id === 'string' ? params.id : undefined;

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (storeId) {
      const fetchedStore = getStoreById(storeId);
      if (fetchedStore) {
        setStore(fetchedStore);
      } else {
        // Handle store not found, e.g., redirect to a 404 page or show message
        router.push("/stores/not-found");
      }
      setLoadingStore(false);
    }
  }, [storeId, router]);

  if (authLoading || loadingStore || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">
          {authLoading ? "Authenticating..." : loadingStore ? "Loading store details..." : "Please sign in."}
        </p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <StoreIcon className="h-12 w-12 text-destructive mb-4" />
        <p className="text-muted-foreground">Store not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/my-stores">Back to My Stores</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="flex-shrink-0">
          <Link href="/my-stores">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to My Stores</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">{store.name}</h1>
        <Badge variant={store.type === "COCO" ? "default" : "secondary"} className={store.type === "COCO" ? "bg-primary/80 text-primary-foreground" : ""}>
          {store.type}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>{store.location}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>Status:</strong> <Badge variant={store.status === "Operational" ? "default" : "outline"} className={store.status === "Operational" ? "bg-accent text-accent-foreground" : ""}>{store.status}</Badge></div>
            <p><strong>Opening Date:</strong> {format(new Date(store.openingDate), "PPP")}</p>
            {store.manager && <p><strong>Manager:</strong> {store.manager}</p>}
            {store.sqft && <p><strong>Size:</strong> {store.sqft.toLocaleString()} sqft</p>}
             {store.currentPromotions && store.currentPromotions.length > 0 && (
                <div>
                    <strong>Current Promotions:</strong>
                    <ul className="list-disc list-inside ml-4">
                        {store.currentPromotions.map((promo, idx) => <li key={idx}>{promo}</li>)}
                    </ul>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Actions</CardTitle>
            <CardDescription>Manage store operations and requests.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full justify-start text-left">
              <Settings className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">Create Task / Instruction</p>
                <p className="text-xs text-muted-foreground">Assign operational tasks to store.</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start text-left">
              <ShoppingCart className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">Write an Order</p>
                <p className="text-xs text-muted-foreground">Manage inventory and place orders.</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start text-left">
              <HelpCircle className="mr-2 h-4 w-4" />
               <div>
                <p className="font-medium">Request Information</p>
                <p className="text-xs text-muted-foreground">Submit info requests to the store.</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Performance Metrics Section Removed */}
      </div>
    </div>
  );
}
