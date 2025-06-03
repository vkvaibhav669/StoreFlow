
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getStoreById, updateMockStore } from "@/lib/data";
import type { StoreItem, ImprovementPoint } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package2, Store as StoreIcon, Settings, HelpCircle, PlusCircle, Edit3, MessageSquare, ThumbsUp, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [store, setStore] = React.useState<StoreItem | null>(null);
  const [loadingStore, setLoadingStore] = React.useState(true);
  const [isAddImprovementDialogOpen, setIsAddImprovementDialogOpen] = React.useState(false);
  const [newImprovementPointText, setNewImprovementPointText] = React.useState("");
  
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
        // router.push("/stores/not-found"); // This would be better if not-found worked directly
        router.replace("/my-stores"); // Fallback redirect if not found during client-side fetch
        toast({title: "Store Not Found", description: "The requested store could not be found.", variant: "destructive"});
      }
      setLoadingStore(false);
    }
  }, [storeId, router, toast]);

  const currentUserRole = React.useMemo(() => {
    if (!user) return 'user';
    return user.role || 'user';
  }, [user]);

  const isUserAdminOrHod = currentUserRole === 'admin' || currentUserRole === 'hod';
  const isStoreManager = React.useMemo(() => {
    if (!user || !store) return false;
    return store.type === 'FOFO' && store.manager === user.name;
  }, [user, store]);

  const canManageImprovements = isUserAdminOrHod || isStoreManager;
  const canRequestOwnershipChange = React.useMemo(() => {
    if (!store) return false;
    if (store.type === 'COCO') return isUserAdminOrHod;
    if (store.type === 'FOFO') return isUserAdminOrHod || isStoreManager;
    return false;
  }, [store, isUserAdminOrHod, isStoreManager]);


  const handleAddImprovementPoint = () => {
    if (!newImprovementPointText.trim() || !store || !user) {
      toast({ title: "Error", description: "Improvement point text cannot be empty.", variant: "destructive" });
      return;
    }

    const newPoint: ImprovementPoint = {
      id: `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: newImprovementPointText,
      addedBy: user.name || user.email,
      addedAt: new Date().toISOString(),
      userAvatar: `https://picsum.photos/seed/${user.id}/40/40`
    };

    const updatedStore = {
      ...store,
      improvementPoints: [...(store.improvementPoints || []), newPoint],
    };

    setStore(updatedStore);
    updateMockStore(updatedStore); 

    toast({ title: "Improvement Point Added", description: "The new improvement point has been saved." });
    setNewImprovementPointText("");
    setIsAddImprovementDialogOpen(false);
  };

  const handleRequestOwnershipChange = () => {
    if (!store) return;
    const targetType = store.type === 'COCO' ? 'FOFO' : 'COCO';
    toast({
      title: "Ownership Change Requested",
      description: `A request to change ownership of "${store.name}" to ${targetType} has been notionally sent.`,
    });
  };


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
    return ( // Should be caught by useEffect, but good fallback.
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
        <StoreIcon className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Store Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The store you are looking for does not exist or could not be loaded.
        </p>
        <Button asChild>
          <Link href="/my-stores">Back to My Stores</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="store-details-content flex flex-col gap-6" aria-labelledby="store-details-heading">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="flex-shrink-0">
          <Link href="/my-stores">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to My Stores</span>
          </Link>
        </Button>
        <h1 id="store-details-heading" className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">{store.name}</h1>
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
            <p><strong>Date Active Since:</strong> {format(new Date(store.openingDate), "PPP")}</p>
            {store.manager && <p><strong>Manager:</strong> {store.manager}</p>}
            {store.sqft && <p><strong>Size:</strong> {store.sqft.toLocaleString()} sqft</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Actions</CardTitle>
            <CardDescription>Manage store operations and requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <Settings className="mr-2 h-4 w-4" />
                <div>
                    <p className="font-medium">Create Task / Instruction</p>
                    <p className="text-xs text-muted-foreground">Assign operational tasks to store.</p>
                </div>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <HelpCircle className="mr-2 h-4 w-4" />
                <div>
                    <p className="font-medium">Request Information</p>
                    <p className="text-xs text-muted-foreground">Submit info requests to the store.</p>
                </div>
                </Button>
            </div>
            {canRequestOwnershipChange && (
              <Button 
                variant="link" 
                size="sm" 
                className="w-full mt-4 text-primary hover:underline justify-start pl-0"
                onClick={handleRequestOwnershipChange}
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Request Change to {store.type === 'COCO' ? 'FOFO' : 'COCO'} Ownership
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Key Improvement Points</CardTitle>
                    <CardDescription>Track and manage areas for store enhancement.</CardDescription>
                </div>
                {canManageImprovements && (
                <Dialog open={isAddImprovementDialogOpen} onOpenChange={setIsAddImprovementDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Point
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>Add New Improvement Point</DialogTitle>
                            <DialogDescription>
                                Describe the area for improvement or action needed for {store.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label htmlFor="improvement-text">Improvement Detail</Label>
                            <Textarea
                                id="improvement-text"
                                value={newImprovementPointText}
                                onChange={(e) => setNewImprovementPointText(e.target.value)}
                                placeholder="e.g., Enhance visual merchandising near entrance."
                                rows={4}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleAddImprovementPoint} disabled={!newImprovementPointText.trim()}>Save Point</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {store.improvementPoints && store.improvementPoints.length > 0 ? (
                    <ScrollArea className="h-[250px] pr-3">
                        <ul className="space-y-4">
                            {store.improvementPoints.slice().reverse().map(point => ( 
                                <li key={point.id} className="p-3 border rounded-md shadow-sm bg-muted/50">
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="h-8 w-8 mt-0.5">
                                            <AvatarImage src={point.userAvatar || `https://placehold.co/40x40.png?text=${point.addedBy.substring(0,1)}`} alt={point.addedBy} data-ai-hint="user avatar" />
                                            <AvatarFallback>{point.addedBy.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm whitespace-pre-wrap">{point.text}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Added by {point.addedBy} - {formatDistanceToNow(new Date(point.addedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No improvement points added yet.</p>
                )}
            </CardContent>
        </Card>

      </div>
    </section>
  );
}
