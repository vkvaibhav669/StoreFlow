
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getStoreById, updateMockStore } from "@/lib/data";
import type { StoreItem, ImprovementPoint, Comment as CommentType, User as AuthUserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Package2, Store as StoreIcon, Settings, HelpCircle, PlusCircle, Edit3, MessageSquare, ThumbsUp, MoreHorizontal, ExternalLink, CheckCircle, MessageCircle, Send, CornerDownRight, Eye, EyeOff } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentCard } from "@/components/comments/CommentCard";
import { cn } from "@/lib/utils";


export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [store, setStore] = React.useState<StoreItem | null>(null);
  const [loadingStore, setLoadingStore] = React.useState(true);
  const [isAddImprovementDialogOpen, setIsAddImprovementDialogOpen] = React.useState(false);
  const [newImprovementPointText, setNewImprovementPointText] = React.useState("");
  const [improvementCommentInputs, setImprovementCommentInputs] = React.useState<Record<string, string>>({});
  const [resolvedPointDiscussionVisibility, setResolvedPointDiscussionVisibility] = React.useState<Record<string, boolean>>({});


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
        router.replace("/my-stores");
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

  const canManageImprovements = isUserAdminOrHod || isStoreManager || (user && store?.members?.some(m => m.email === user.email));
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
      addedBy: user.name || user.email || "System",
      addedAt: new Date().toISOString(),
      userAvatar: `https://picsum.photos/seed/${user.id || 'system'}/40/40`,
      comments: [],
      isResolved: false,
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

  const handleToggleOwnershipChangeRequest = () => {
    if (!store) return;

    const currentlyRequested = !!store.ownershipChangeRequested;
    const newRequestedState = !currentlyRequested;
    const targetType = store.type === 'COCO' ? 'FOFO' : 'COCO';

    const updatedStore = {
      ...store,
      ownershipChangeRequested: newRequestedState,
    };

    setStore(updatedStore);
    updateMockStore(updatedStore);

    if (newRequestedState) {
      toast({
        title: "Ownership Change Requested",
        description: `A request to change ownership of "${store.name}" to ${targetType} has been sent.`,
      });
    } else {
      toast({
        title: "Ownership Change Request Cancelled",
        description: `The request to change ownership for "${store.name}" has been cancelled.`,
      });
    }
  };

  const toggleResolvedPointDiscussion = (pointId: string) => {
    setResolvedPointDiscussionVisibility(prev => ({
      ...prev,
      [pointId]: !prev[pointId]
    }));
  };

  const handleToggleImprovementResolved = (pointId: string) => {
    if (!store || !user) return;
    let pointIsNowResolved = false;
    const updatedPoints = (store.improvementPoints || []).map(p => {
      if (p.id === pointId) {
        const newResolvedState = !p.isResolved;
        pointIsNowResolved = newResolvedState;
        return {
          ...p,
          isResolved: newResolvedState,
          resolvedBy: newResolvedState ? (user.name || user.email) : undefined,
          resolvedAt: newResolvedState ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });
    const updatedStore = { ...store, improvementPoints: updatedPoints };
    setStore(updatedStore);
    updateMockStore(updatedStore);
    
    if (pointIsNowResolved) {
      // Hide discussion by default when resolved
      setResolvedPointDiscussionVisibility(prev => ({ ...prev, [pointId]: false }));
    } else {
      // Show discussion if marked unresolved (or let default conditional logic handle it)
       setResolvedPointDiscussionVisibility(prev => {
        const newState = {...prev};
        delete newState[pointId]; // Or set to true: newState[pointId] = true;
        return newState;
       });
    }

    toast({ title: "Improvement Point Updated", description: `Status changed for point: ${updatedPoints.find(p => p.id === pointId)?.text.substring(0,30)}...` });
  };

  const handleAddCommentToImprovement = (pointId: string, text: string) => {
    if (!text.trim() || !store || !user) return;
    const newComment: CommentType = {
      id: `imp-comment-${Date.now()}`,
      author: user.name || user.email || "System",
      avatarUrl: `https://picsum.photos/seed/${user.id || 'commenter'}/40/40`,
      timestamp: new Date().toISOString(),
      text: text,
      replies: [],
    };
    const updatedPoints = (store.improvementPoints || []).map(p => {
      if (p.id === pointId) {
        return { ...p, comments: [newComment, ...(p.comments || [])] };
      }
      return p;
    });
    const updatedStore = { ...store, improvementPoints: updatedPoints };
    setStore(updatedStore);
    updateMockStore(updatedStore);
    setImprovementCommentInputs(prev => ({...prev, [pointId]: ""})); 
    toast({ title: "Comment Added", description: "Your comment has been posted." });
  };

  const handleReplyToImprovementComment = (pointId: string, commentId: string, replyText: string) => {
    if (!replyText.trim() || !store || !user) return;

    const addReplyRecursively = (currentComments: CommentType[]): CommentType[] => {
      return currentComments.map(comment => {
        if (comment.id === commentId) {
          const newReply: CommentType = {
            id: `imp-reply-${Date.now()}`,
            author: user.name || user.email || "System",
            avatarUrl: `https://picsum.photos/seed/${user.id || 'replyUser'}/40/40`,
            timestamp: new Date().toISOString(),
            text: replyText,
            replies: [],
          };
          return { ...comment, replies: [newReply, ...(comment.replies || [])] };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: addReplyRecursively(comment.replies) };
        }
        return comment;
      });
    };

    const updatedPoints = (store.improvementPoints || []).map(p => {
      if (p.id === pointId) {
        return { ...p, comments: addReplyRecursively(p.comments || []) };
      }
      return p;
    });
    const updatedStore = { ...store, improvementPoints: updatedPoints };
    setStore(updatedStore);
    updateMockStore(updatedStore);
    toast({ title: "Reply Posted", description: "Your reply has been added." });
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
    return (
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
  const targetOwnershipType = store.type === 'COCO' ? 'FOFO' : 'COCO';

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
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <Edit3 className="mr-2 h-4 w-4" />
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
                <div className="pt-2 self-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" /> Store Settings
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={handleToggleOwnershipChangeRequest}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {store.ownershipChangeRequested
                                ? "Cancel Ownership Change Request"
                                : `Request Change to ${targetOwnershipType} Ownership`}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
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
                    <ScrollArea className="max-h-[500px] pr-3">
                        <ul className="space-y-6">
                            {store.improvementPoints.slice().reverse().map(point => (
                                <li key={point.id} className="p-4 border rounded-lg shadow-sm bg-card">
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="h-10 w-10 mt-1">
                                            <AvatarImage src={point.userAvatar || `https://placehold.co/40x40.png?text=${point.addedBy.substring(0,1)}`} alt={point.addedBy} data-ai-hint="user avatar" />
                                            <AvatarFallback>{point.addedBy.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-md font-medium whitespace-pre-wrap",
                                                point.isResolved && "line-through text-muted-foreground"
                                            )}>{point.text}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Added by {point.addedBy} - {formatDistanceToNow(new Date(point.addedAt), { addSuffix: true })}
                                            </p>
                                            {point.isResolved && point.resolvedBy && point.resolvedAt && (
                                                <p className="text-xs text-accent-foreground/80 bg-accent/80 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                                                    Resolved by {point.resolvedBy} on {format(new Date(point.resolvedAt), "PPP")}
                                                </p>
                                            )}
                                        </div>
                                        {canManageImprovements && (
                                           <div className="flex flex-col items-end space-y-1">
                                                <Switch
                                                    id={`resolve-switch-${point.id}`}
                                                    checked={!!point.isResolved}
                                                    onCheckedChange={() => handleToggleImprovementResolved(point.id)}
                                                    aria-label={point.isResolved ? "Mark as unresolved" : "Mark as resolved"}
                                                />
                                                 <Label htmlFor={`resolve-switch-${point.id}`} className="text-xs text-muted-foreground">
                                                    {point.isResolved ? "Resolved" : "Resolve"}
                                                 </Label>
                                           </div>
                                        )}
                                    </div>

                                    {point.isResolved && (
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => toggleResolvedPointDiscussion(point.id)}
                                        className="mt-3 text-xs pl-0"
                                      >
                                        {resolvedPointDiscussionVisibility[point.id] ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
                                        {resolvedPointDiscussionVisibility[point.id] ? "Hide" : "Show"} Discussion & KPI Details
                                      </Button>
                                    )}

                                    {(!point.isResolved || (point.isResolved && resolvedPointDiscussionVisibility[point.id])) && (
                                      <div className="mt-4 pt-3 border-t">
                                          <h4 className="text-sm font-semibold mb-2 text-card-foreground flex items-center">
                                              <MessageCircle className="mr-2 h-4 w-4" /> Discussion ({point.comments?.length || 0})
                                          </h4>
                                          {(point.comments || []).length > 0 && (
                                              <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-2">
                                                  {(point.comments || []).map(comment => (
                                                      <CommentCard
                                                          key={comment.id}
                                                          comment={comment}
                                                          onReply={(commentId, replyText) => handleReplyToImprovementComment(point.id, commentId, replyText)}
                                                      />
                                                  ))}
                                              </div>
                                          )}
                                          <div className="flex items-start space-x-2 mt-2">
                                              <Avatar className="h-8 w-8 mt-1">
                                                  <AvatarImage src={`https://picsum.photos/seed/${user?.id || 'currentUser'}/40/40`} alt={user?.name || "User"} data-ai-hint="user avatar"/>
                                                  <AvatarFallback>{(user?.name || user?.email || "U").substring(0,2).toUpperCase()}</AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1">
                                              <Textarea
                                                  placeholder="Add a comment..."
                                                  value={improvementCommentInputs[point.id] || ""}
                                                  onChange={(e) => setImprovementCommentInputs(prev => ({...prev, [point.id]: e.target.value}))}
                                                  rows={2}
                                                  className="mb-2 text-sm"
                                              />
                                              <Button 
                                                  size="sm" 
                                                  onClick={() => handleAddCommentToImprovement(point.id, improvementCommentInputs[point.id] || "")}
                                                  disabled={!(improvementCommentInputs[point.id] || "").trim()}
                                              >
                                                  <Send className="mr-2 h-3.5 w-3.5" /> Post Comment
                                              </Button>
                                              </div>
                                          </div>
                                      </div>
                                    )}
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

