
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Filter, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Package2 } from "lucide-react";
import { mockStores } from "@/lib/data";
import type { StoreItem, StoreType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

type StoreFilterType = StoreType | "All";

export default function MyStoresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filterType, setFilterType] = React.useState<StoreFilterType>("All");

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  const filteredStores = React.useMemo(() => {
    let storesToShow = mockStores.filter(store => store.status === "Operational");
    if (filterType !== "All") {
      storesToShow = storesToShow.filter(store => store.type === filterType);
    }
    return storesToShow;
  }, [filterType]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading..." : "Please sign in."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl">My Operational Stores</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={filterType} onValueChange={(value) => setFilterType(value as StoreFilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="COCO">COCO (Company Owned)</SelectItem>
              <SelectItem value="FOFO">FOFO (Franchise Owned)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No operational stores match the current filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <Card key={store.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{store.name}</CardTitle>
                  <Badge variant={store.type === "COCO" ? "default" : "secondary"} className={store.type === "COCO" ? "bg-primary/80 text-primary-foreground" : ""}>
                    {store.type}
                  </Badge>
                </div>
                <CardDescription>{store.location}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                <p>
                  <strong>Status:</strong> <Badge variant={store.status === "Operational" ? "default" : "outline"} className={store.status === "Operational" ? "bg-accent text-accent-foreground" : ""}>{store.status}</Badge>
                </p>
                <p>
                  <strong>Opening Date:</strong> {format(new Date(store.openingDate), "PPP")}
                </p>
                {store.manager && <p><strong>Manager:</strong> {store.manager}</p>}
                {store.sqft && <p><strong>Size:</strong> {store.sqft.toLocaleString()} sqft</p>}
                
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/stores/${store.id}`}>
                    View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
