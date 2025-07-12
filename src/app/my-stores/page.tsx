"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Filter, ArrowUpRight, PlusCircle, CalendarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Package2 } from "lucide-react";
import type { StoreItem, StoreType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type StoreFilterType = StoreType | "All";

export default function MyStoresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allStores, setAllStores] = React.useState<StoreItem[]>([]);
  const [filterType, setFilterType] = React.useState<StoreFilterType>("All");

  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = React.useState(false);
  const [isSubmittingStore, setIsSubmittingStore] = React.useState(false);
  const [newStoreName, setNewStoreName] = React.useState("");
  const [newStoreLocation, setNewStoreLocation] = React.useState("");
  const [newStoreType, setNewStoreType] = React.useState<StoreType>("COCO");
  const [newStoreManager, setNewStoreManager] = React.useState("");
  const [newStoreSqft, setNewStoreSqft] = React.useState<number | "">("");
  const [newStoreOpeningDate, setNewStoreOpeningDate] = React.useState<Date | undefined>(new Date());

  const canAddStore = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  // Fetch all stores from backend using POST
  const fetchStores = React.useCallback(async () => {
    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWQwYTc4NTY1NmU2Nzc4MjRhMzE4NSIsImlhdCI6MTc1MjI5OTI5NywiZXhwIjoxNzUyMzM1Mjk3fQ.xr-4WLxbGACvW52QMHryocufWVe-C-VRgbVUsGeStII"
      // user?.token || localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({}), // send empty body or filter if needed
      });
      if (!res.ok) throw new Error("Failed to fetch stores");
      const data = await res.json();
      setAllStores(data.map((store: any) => ({ ...store, id: store._id })));
    } catch (error) {
      toast({ title: "Error", description: "Failed to load stores.", variant: "destructive" });
    }
  }, [user, toast]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
    fetchStores();
  }, [user, authLoading, router, fetchStores]);

  const filteredStores = React.useMemo(() => {
    let storesToShow = allStores;
    if (filterType !== "All") {
      storesToShow = storesToShow.filter(store => store.type === filterType);
    }
    return storesToShow;
  }, [allStores, filterType]);

  const handleAddNewStore = async () => {
    if (!newStoreName.trim() || !newStoreLocation.trim() || !newStoreOpeningDate) {
      toast({ title: "Validation Error", description: "Store Name, Location, and Opening Date are required.", variant: "destructive" });
      return;
    }
    if (!canAddStore) {
      toast({ title: "Permission Denied", description: "You do not have permission to add stores.", variant: "destructive" });
      return;
    }

    setIsSubmittingStore(true);
    const newStorePayload: Partial<StoreItem> = {
      name: newStoreName,
      location: newStoreLocation,
      type: newStoreType,
      status: "Planned",
      openingDate: format(newStoreOpeningDate, "yyyy-MM-dd"),
      manager: newStoreManager.trim() || undefined,
      sqft: newStoreSqft ? Number(newStoreSqft) : undefined,
    };

    try {
      const token = user?.token || localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(newStorePayload),
      });
      if (!res.ok) throw new Error("Failed to create store");
      const createdStore = await res.json();
      await fetchStores(); // Refresh the store list
      toast({ title: "Store Created", description: `Store "${createdStore.name}" has been added.` });
      setIsAddStoreDialogOpen(false);
      setNewStoreName("");
      setNewStoreLocation("");
      setNewStoreType("COCO");
      setNewStoreManager("");
      setNewStoreSqft("");
      setNewStoreOpeningDate(new Date());
    } catch (error) {
      console.error("Error creating store:", error);
      toast({ title: "Error", description: "Failed to create store. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingStore(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (!user) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-muted-foreground">Please sign in to view your stores.</p>
      </div>
    );
  }

  return (
    <section className="my-stores-content flex flex-col gap-6" aria-labelledby="my-stores-heading">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 id="my-stores-heading" className="text-2xl font-semibold md:text-3xl">All Company Stores</h1>
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
          {canAddStore && (
            <Dialog open={isAddStoreDialogOpen} onOpenChange={(isOpen) => {
                setIsAddStoreDialogOpen(isOpen);
                if (!isOpen) {
                    setNewStoreName(""); setNewStoreLocation(""); setNewStoreType("COCO");
                    setNewStoreManager(""); setNewStoreSqft(""); setNewStoreOpeningDate(new Date());
                }
            }}>
                <DialogTrigger asChild>
                    <Button size="sm" disabled={isSubmittingStore}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Store
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Store</DialogTitle>
                        <DialogDescription>
                            Enter the details for a new store location.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store-name" className="text-right">Name *</Label>
                            <Input id="store-name" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} className="col-span-3" placeholder="e.g., Jayanagar High Street" disabled={isSubmittingStore} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store-location" className="text-right">Location *</Label>
                            <Input id="store-location" value={newStoreLocation} onChange={(e) => setNewStoreLocation(e.target.value)} className="col-span-3" placeholder="e.g., Bangalore, Karnataka" disabled={isSubmittingStore} />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store-type" className="text-right">Type</Label>
                             <Select value={newStoreType} onValueChange={(value) => setNewStoreType(value as StoreType)} disabled={isSubmittingStore}>
                                <SelectTrigger id="store-type" className="col-span-3"><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COCO">COCO</SelectItem>
                                    <SelectItem value="FOFO">FOFO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store-manager" className="text-right">Manager</Label>
                            <Input id="store-manager" value={newStoreManager} onChange={(e) => setNewStoreManager(e.target.value)} className="col-span-3" placeholder="Manager's Name" disabled={isSubmittingStore} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store-sqft" className="text-right">Sqft</Label>
                            <Input id="store-sqft" type="number" value={newStoreSqft} onChange={(e) => setNewStoreSqft(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" placeholder="e.g., 3500" disabled={isSubmittingStore} />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="store-opening-date" className="text-right">Opening *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    id="store-opening-date"
                                    variant={"outline"}
                                    className={cn("col-span-3 justify-start text-left font-normal", !newStoreOpeningDate && "text-muted-foreground")}
                                    disabled={isSubmittingStore}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newStoreOpeningDate ? format(newStoreOpeningDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={newStoreOpeningDate} onSelect={setNewStoreOpeningDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingStore}>Cancel</Button></DialogClose>
                        <Button type="submit" onClick={handleAddNewStore} disabled={isSubmittingStore}>
                            {isSubmittingStore ? "Adding..." : "Add Store"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
           )}
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No stores found.
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
                <div className="flex items-center">
                  <strong className="mr-1">Status:</strong> 
                  <Badge 
                    variant={store.status === "Operational" ? "default" : "outline"} 
                    className={cn(
                        "font-semibold",
                        store.status === "Operational" && "bg-accent text-accent-foreground",
                        store.status === "Under Construction" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                        store.status === "Planned" && "bg-blue-100 text-blue-800 border-blue-300"
                    )}
                  >
                    {store.status}
                  </Badge>
                </div>
                <p>
                  <strong>Target Opening:</strong> {format(new Date(store.openingDate), "PPP")}
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
    </section>
  );
}
