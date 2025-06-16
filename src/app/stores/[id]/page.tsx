
"use client";

import * as React from "react";
import { useRouter, useParams, notFound } from "next/navigation"; // Imported notFound
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getStoreById, 
  updateStore,
  addImprovementPointToStore,
  updateImprovementPointInStore,
  addCommentToImprovementPoint,
  addStoreTask,
  updateStoreTask,
  deleteStoreTask
} from "@/lib/data";
import type { StoreItem, ImprovementPoint, Comment as CommentType, StoreTask, TaskPriority } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Package2, Store as StoreIcon, Settings, HelpCircle, PlusCircle, Edit3, MessageSquare, MoreHorizontal, ExternalLink, CheckCircle, MessageCircle, Send, CornerDownRight, Eye, EyeOff, ListFilter, Trash2, CalendarIcon, AlertTriangle, Edit, Check } from "lucide-react";
import { format, formatDistanceToNow, isValid } from "date-fns";
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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentCard } from "@/components/comments/CommentCard";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const allStoreTaskPriorities: TaskPriority[] = ["High", "Medium", "Low", "None"];
const allStoreTaskStatuses: StoreTask['status'][] = ["Pending", "In Progress", "Completed", "Blocked"];


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

  const [isSubmittingImprovement, setIsSubmittingImprovement] = React.useState(false);
  const [isUpdatingOwnership, setIsUpdatingOwnership] = React.useState(false);
  const [isUpdatingImpPointStatus, setIsUpdatingImpPointStatus] = React.useState<Record<string, boolean>>({});
  const [isSubmittingImpComment, setIsSubmittingImpComment] = React.useState<Record<string, boolean>>({});

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const [newTaskForm, setNewTaskForm] = React.useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: undefined as Date | undefined,
    priority: "Medium" as TaskPriority,
  });
  const [taskFilterStatus, setTaskFilterStatus] = React.useState<StoreTask['status'] | "All">("All");
  const [editingStoreTask, setEditingStoreTask] = React.useState<StoreTask | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = React.useState(false);
  const [isSubmittingStoreTask, setIsSubmittingStoreTask] = React.useState(false);
  const [isRequestInfoDialogOpen, setIsRequestInfoDialogOpen] = React.useState(false);
  const [requestInfoText, setRequestInfoText] = React.useState("");


  const storeId = typeof params.id === 'string' ? params.id : undefined;

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (user && storeId) { 
      setLoadingStore(true);
      getStoreById(storeId)
        .then((fetchedStore) => {
          if (fetchedStore) {
            setStore(fetchedStore);
          } else {
            notFound(); // Use Next.js notFound function
          }
        })
        .catch(error => {
          console.error("Failed to fetch store:", error);
          toast({title: "Error", description: "Could not load store details.", variant: "destructive"});
          // Optionally, could also call notFound() here or redirect to a generic error page
          router.replace("/my-stores"); 
        })
        .finally(() => {
          setLoadingStore(false);
        });
    } else if (!authLoading && !user) {
        router.replace("/auth/signin"); 
    }
  }, [storeId, user, authLoading, router, toast]);

  const currentUserRole = user?.role;
  const isUserAdmin = currentUserRole === 'Admin';
  const isUserSuperAdmin = currentUserRole === 'SuperAdmin';
  const isUserMember = currentUserRole === 'Member';

  const canManageStoreFeatures = isUserAdmin || isUserSuperAdmin;

  const canRequestOwnershipChange = React.useMemo(() => {
    if (!store) return false;
    return isUserAdmin || isUserSuperAdmin || (store.type === 'FOFO' && store.manager === user?.name);
  }, [store, isUserAdmin, isUserSuperAdmin, user?.name]);


  const handleAddImprovementPoint = async () => {
    if (!newImprovementPointText.trim() || !store || !user) {
      toast({ title: "Error", description: "Improvement point text cannot be empty.", variant: "destructive" });
      return;
    }
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", description: "You do not have permission to add improvement points.", variant: "destructive" });
      return;
    }
    setIsSubmittingImprovement(true);
    const newPointPayload: Partial<ImprovementPoint> = {
      text: newImprovementPointText,
      addedBy: user.name || user.email || "System",
      addedAt: new Date().toISOString(),
      userAvatar: `https://picsum.photos/seed/${user.id || 'system'}/40/40`,
      comments: [],
      isResolved: false,
    };
    try {
      const addedPoint = await addImprovementPointToStore(store.id, newPointPayload);
      setStore(prevStore => prevStore ? { ...prevStore, improvementPoints: [addedPoint, ...(prevStore.improvementPoints || [])].sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()) } : null);
      toast({ title: "Improvement Point Added", description: "The new improvement point has been saved." });
      setNewImprovementPointText("");
      setIsAddImprovementDialogOpen(false);
    } catch (error) {
      console.error("Error adding improvement point:", error);
      toast({ title: "Error", description: "Failed to add improvement point.", variant: "destructive" });
    } finally {
      setIsSubmittingImprovement(false);
    }
  };

  const handleToggleOwnershipChangeRequest = async () => {
    if (!store || !canRequestOwnershipChange) {
        toast({title: "Permission Denied", description: "You do not have permission to request an ownership change for this store.", variant: "destructive"});
        return;
    }
    setIsUpdatingOwnership(true);
    const currentlyRequested = !!store.ownershipChangeRequested;
    const newRequestedState = !currentlyRequested;
    const targetType = store.type === 'COCO' ? 'FOFO' : 'COCO';
    
    try {
        const updatedStoreData = await updateStore(store.id, { ownershipChangeRequested: newRequestedState });
        setStore(updatedStoreData);
        if (newRequestedState) {
        toast({ title: "Ownership Change Requested", description: `A request to change ownership of "${store.name}" to ${targetType} has been sent.` });
        } else {
        toast({ title: "Ownership Change Request Cancelled", description: `The request to change ownership for "${store.name}" has been cancelled.` });
        }
    } catch (error) {
        console.error("Error toggling ownership change request:", error);
        toast({ title: "Error", description: "Could not update ownership change request.", variant: "destructive" });
    } finally {
        setIsUpdatingOwnership(false);
    }
  };

  const toggleResolvedPointDiscussion = (pointId: string) => {
    setResolvedPointDiscussionVisibility(prev => ({ ...prev, [pointId]: !prev[pointId] }));
  };

  const handleToggleImprovementResolved = async (pointId: string) => {
    if (!store || !user || !canManageStoreFeatures) {
        toast({title: "Permission Denied", description: "You do not have permission to update improvement points.", variant: "destructive"});
        return;
    }
    const point = store.improvementPoints?.find(p => p.id === pointId);
    if (!point) return;

    setIsUpdatingImpPointStatus(prev => ({...prev, [pointId]: true }));
    const newResolvedState = !point.isResolved;
    const updatePayload: Partial<ImprovementPoint> = {
        isResolved: newResolvedState,
        resolvedBy: newResolvedState ? (user.name || user.email) : undefined,
        resolvedAt: newResolvedState ? new Date().toISOString() : undefined,
    };

    try {
        const updatedPoint = await updateImprovementPointInStore(store.id, pointId, updatePayload);
        setStore(prevStore => {
            if (!prevStore) return null;
            return {
                ...prevStore,
                improvementPoints: (prevStore.improvementPoints || []).map(p => p.id === pointId ? updatedPoint : p)
            };
        });
        if (newResolvedState) {
          setResolvedPointDiscussionVisibility(prev => ({ ...prev, [pointId]: false }));
        } else {
          setResolvedPointDiscussionVisibility(prev => { const newState = {...prev}; delete newState[pointId]; return newState; });
        }
        toast({ title: "Improvement Point Updated", description: `Status changed for point: ${updatedPoint.text.substring(0,30)}...` });
    } catch (error) {
        console.error("Error updating improvement point status:", error);
        toast({ title: "Error", description: "Could not update improvement point status.", variant: "destructive" });
    } finally {
        setIsUpdatingImpPointStatus(prev => ({...prev, [pointId]: false }));
    }
  };

  const handleAddCommentToImprovement = async (pointId: string, text: string) => {
    if (!text.trim() || !store || !user) return;
    setIsSubmittingImpComment(prev => ({...prev, [pointId]: true}));
    const newCommentPayload: Partial<CommentType> = { 
      author: user.name || user.email || "System", 
      avatarUrl: `https://picsum.photos/seed/${user.id || 'commenter'}/40/40`, 
      timestamp: new Date().toISOString(), 
      text: text, 
      replies: [],
    };
    try {
        const addedComment = await addCommentToImprovementPoint(store.id, pointId, newCommentPayload);
        setStore(prevStore => {
            if (!prevStore) return null;
            return {
                ...prevStore,
                improvementPoints: (prevStore.improvementPoints || []).map(p => 
                    p.id === pointId ? { ...p, comments: [addedComment, ...(p.comments || [])] } : p
                )
            };
        });
        setImprovementCommentInputs(prev => ({...prev, [pointId]: ""}));
        toast({ title: "Comment Added", description: "Your comment has been posted." });
    } catch (error) {
        console.error("Error adding comment:", error);
        toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    } finally {
        setIsSubmittingImpComment(prev => ({...prev, [pointId]: false}));
    }
  };

  const handleReplyToImprovementComment = async (pointId: string, commentId: string, replyText: string) => {
    if (!replyText.trim() || !store || !user) return;
    setIsSubmittingImpComment(prev => ({...prev, [`${pointId}-${commentId}`]: true}));
    const newReplyPayload: Partial<CommentType> & { parentCommentId?: string } = { 
      author: user.name || user.email || "System", 
      avatarUrl: `https://picsum.photos/seed/${user.id || 'replyUser'}/40/40`, 
      timestamp: new Date().toISOString(), 
      text: replyText,
      parentCommentId: commentId 
    };

    try {
      const addedReply = await addCommentToImprovementPoint(store.id, pointId, newReplyPayload);
      
      setStore(prevStore => {
        if (!prevStore) return null;
        const newPoints = (prevStore.improvementPoints || []).map(p => {
          if (p.id === pointId) {
            const addReplyFn = (comments: CommentType[]): CommentType[] => {
              return comments.map(c => {
                if (c.id === commentId) {
                  return { ...c, replies: [addedReply, ...(c.replies || [])] };
                }
                if (c.replies && c.replies.length > 0) {
                  return { ...c, replies: addReplyFn(c.replies) };
                }
                return c;
              });
            };
            return { ...p, comments: addReplyFn(p.comments || []) };
          }
          return p;
        });
        return { ...prevStore, improvementPoints: newPoints };
      });
      toast({ title: "Reply Posted", description: "Your reply has been added." });
    } catch (error) {
        console.error("Error posting reply:", error);
        toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    } finally {
        setIsSubmittingImpComment(prev => ({...prev, [`${pointId}-${commentId}`]: false}));
    }
  };

  const handleNewTaskFormChange = (field: keyof typeof newTaskForm, value: any) => {
    setNewTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNewStoreTask = async () => {
    if (!newTaskForm.title.trim() || !store || !user) {
      toast({ title: "Error", description: "Task title is required.", variant: "destructive" });
      return;
    }
     if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", description: "You do not have permission to add tasks.", variant: "destructive" });
      return;
    }
    setIsSubmittingStoreTask(true);
    const newTaskPayload: Partial<StoreTask> = {
      storeId: store.id,
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim() || undefined,
      assignedTo: newTaskForm.assignedTo.trim() || undefined,
      status: "Pending",
      priority: newTaskForm.priority,
      createdAt: new Date().toISOString(),
      createdBy: user.name || user.email!,
      dueDate: newTaskForm.dueDate ? format(newTaskForm.dueDate, "yyyy-MM-dd") : undefined,
    };
    try {
        const addedTask = await addStoreTask(store.id, newTaskPayload);
        setStore(prevStore => prevStore ? { ...prevStore, tasks: [addedTask, ...(prevStore.tasks || [])] } : null);
        toast({ title: "Task Added", description: `"${addedTask.title}" added to store tasks.` });
        setIsAddTaskDialogOpen(false);
        setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" });
    } catch (error) {
        console.error("Error adding store task:", error);
        toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };
  
  const handleOpenEditTaskDialog = (task: StoreTask) => {
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", description: "You do not have permission to edit tasks.", variant: "destructive" });
      return;
    }
    setEditingStoreTask(task);
    setNewTaskForm({
        title: task.title,
        description: task.description || "",
        assignedTo: task.assignedTo || "",
        dueDate: task.dueDate && isValid(new Date(task.dueDate)) ? new Date(task.dueDate) : undefined,
        priority: task.priority || "Medium",
    });
    setIsEditTaskDialogOpen(true);
  };

  const handleSaveEditedStoreTask = async () => {
    if (!editingStoreTask || !newTaskForm.title.trim() || !store || !user) {
        toast({ title: "Error", description: "Task title is required.", variant: "destructive" });
        return;
    }
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", description: "You do not have permission to edit tasks.", variant: "destructive" });
      return;
    }
    setIsSubmittingStoreTask(true);
    const updatedTaskPayload: Partial<StoreTask> = {
        title: newTaskForm.title.trim(),
        description: newTaskForm.description.trim() || undefined,
        assignedTo: newTaskForm.assignedTo.trim() || undefined,
        priority: newTaskForm.priority,
        dueDate: newTaskForm.dueDate ? format(newTaskForm.dueDate, "yyyy-MM-dd") : undefined,
    };
    try {
        const updatedTask = await updateStoreTask(store.id, editingStoreTask.id, updatedTaskPayload);
        setStore(prevStore => {
            if(!prevStore) return null;
            return {
                ...prevStore,
                tasks: (prevStore.tasks || []).map(t => t.id === editingStoreTask.id ? {...updatedTask, status: t.status } : t) 
            };
        });
        toast({ title: "Task Updated", description: `Task "${updatedTask.title}" has been updated.` });
        setIsEditTaskDialogOpen(false);
        setEditingStoreTask(null);
        setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" });
    } catch (error) {
        console.error("Error updating store task:", error);
        toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };


  const handleUpdateStoreTaskStatus = async (taskId: string, newStatus: StoreTask['status']) => {
    if (!store || !canManageStoreFeatures) { 
        toast({title: "Permission Denied", description: "You do not have permission to update task status.", variant: "destructive"});
        return;
    }
    setIsSubmittingStoreTask(true); 
    try {
        const updatedTask = await updateStoreTask(store.id, taskId, { status: newStatus });
        setStore(prevStore => {
            if (!prevStore) return null;
            return {
                ...prevStore,
                tasks: (prevStore.tasks || []).map(task => task.id === taskId ? updatedTask : task)
            };
        });
        toast({ title: "Task Status Updated" });
    } catch (error) {
        console.error("Error updating task status:", error);
        toast({ title: "Error", description: "Could not update task status.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };

  const handleDeleteStoreTask = async (taskId: string) => {
    if (!store || !canManageStoreFeatures) {
        toast({title: "Permission Denied", description: "You do not have permission to delete tasks.", variant: "destructive"});
        return;
    }
    const taskToDelete = store.tasks?.find(t => t.id === taskId);
    if (!taskToDelete) return;
    setIsSubmittingStoreTask(true);
    try {
        await deleteStoreTask(store.id, taskId);
        setStore(prevStore => {
            if(!prevStore) return null;
            return {
                ...prevStore,
                tasks: (prevStore.tasks || []).filter(task => task.id !== taskId)
            };
        });
        toast({ title: "Task Deleted", description: `Task "${taskToDelete.title}" has been removed.` });
    } catch (error) {
        console.error("Error deleting task:", error);
        toast({ title: "Error", description: "Could not delete task.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };

  const handleSendRequestInfo = () => {
    if (!requestInfoText.trim() || !store) {
      toast({ title: "Cannot Send", description: "Please enter a message for your request.", variant: "destructive" });
      return;
    }
    toast({
      title: "Information Request Sent (Simulated)",
      description: `Your request: "${requestInfoText.substring(0, 50)}..." has been "sent" to the store manager ${store.manager ? `(${store.manager})` : ''}.`,
    });
    setRequestInfoText("");
    setIsRequestInfoDialogOpen(false);
  };


  const filteredStoreTasks = React.useMemo(() => {
    if (!store?.tasks) return [];
    return store.tasks.filter(task =>
      taskFilterStatus === "All" || task.status === taskFilterStatus
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store?.tasks, taskFilterStatus]);


  if (authLoading || loadingStore || (!user && !authLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">
          {authLoading ? "Authenticating..." : loadingStore ? "Loading store details..." : "Please sign in."}
        </p>
      </div>
    );
  }

  // If loading is complete and store is still null (e.g., after fetch resulted in notFound),
  // notFound() would have been called during useEffect, so this component instance
  // should effectively unmount or be replaced by the not-found UI.
  // A direct `if (!store) return null;` here can prevent flicker if needed, but notFound() is preferred.
  if (!store && !loadingStore) { 
      // This case should ideally be handled by the notFound() call in useEffect
      // if the API confirms the store doesn't exist.
      // If notFound() was called, this part of the code won't be reached.
      // If somehow it is (e.g., error before notFound() is called), this is a fallback.
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <p className="text-muted-foreground">Store data is unavailable.</p>
        </div>
      );
  }
  // If store is null *during* loading, the loading spinner above handles it.
  // If loading is finished, and store is *still* null, it means `notFound()` should have been called.
  // For safety, if execution reaches here and `store` is null, it's an unexpected state.
  // However, Next.js `notFound()` should prevent rendering this far.
  if (!store) return null; // Should not be reached if notFound() works.


  const targetOwnershipType = store.type === 'COCO' ? 'FOFO' : 'COCO';

  const priorityBadgeVariant = (priority?: TaskPriority) => {
    switch (priority) {
        case "High": return "destructive";
        case "Medium": return "secondary";
        case "Low": return "outline";
        default: return "outline";
    }
  };
  const statusBadgeVariant = (status: StoreTask['status']) => {
    switch (status) {
        case "Completed": return "default"; 
        case "Blocked": return "destructive";
        case "In Progress": return "secondary";
        default: return "outline"; 
    }
  };
   const statusBadgeClass = (status: StoreTask['status']) => {
    if (status === "Completed") return "bg-accent text-accent-foreground";
    return "";
  };


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
            
            {store.ownershipChangeRequested && (
              <div className="mt-4 p-3 rounded-md border border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Ownership Change Pending
                  </p>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  A request to change ownership to {targetOwnershipType} is awaiting approval.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Actions</CardTitle>
            <CardDescription>Manage store operations and requests.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <div className="flex flex-wrap gap-2 items-center">
                <Dialog open={isRequestInfoDialogOpen} onOpenChange={(isOpen) => {
                    setIsRequestInfoDialogOpen(isOpen);
                    if (!isOpen) setRequestInfoText(""); 
                }}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <HelpCircle className="mr-2 h-4 w-4" /> Request Info
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Request Information from Store Manager</DialogTitle>
                            <DialogDescription>
                                Compose your message below. This will be sent to {store.manager || 'the store manager'}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="request-info-message" className="sr-only">Your Message</Label>
                            <Textarea
                                id="request-info-message"
                                value={requestInfoText}
                                onChange={(e) => setRequestInfoText(e.target.value)}
                                placeholder="Type your information request here..."
                                rows={5}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSendRequestInfo} disabled={!requestInfoText.trim()}>
                                Send Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {canRequestOwnershipChange && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isUpdatingOwnership}>
                                <Settings className="mr-2 h-4 w-4" /> {isUpdatingOwnership ? "Updating..." : "Store Settings"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={handleToggleOwnershipChangeRequest} disabled={isUpdatingOwnership}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {store.ownershipChangeRequested
                                ? "Cancel Ownership Change Request"
                                : `Request Change to ${targetOwnershipType} Ownership`}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {canManageStoreFeatures && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-dashed">
                <Dialog open={isAddImprovementDialogOpen} onOpenChange={setIsAddImprovementDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" disabled={isSubmittingImprovement}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {isSubmittingImprovement ? "Adding..." : "Add Point"}
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
                                disabled={isSubmittingImprovement}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isSubmittingImprovement}>Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleAddImprovementPoint} disabled={!newImprovementPointText.trim() || isSubmittingImprovement}>
                                {isSubmittingImprovement ? "Saving..." : "Save Point"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                 <Button size="sm" onClick={() => { setIsAddTaskDialogOpen(true); setEditingStoreTask(null); setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" }); }} disabled={isSubmittingStoreTask}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {isSubmittingStoreTask ? "Processing..." : "Add Task"}
                </Button>
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
            </CardHeader>
            <CardContent>
                {store.improvementPoints && store.improvementPoints.length > 0 ? (
                    <ScrollArea className="max-h-[500px] pr-3">
                        <ul className="space-y-6">
                            {store.improvementPoints.slice().sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).map(point => (
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
                                        {canManageStoreFeatures && (
                                           <div className="flex flex-col items-end space-y-1">
                                                <Switch
                                                    id={`resolve-switch-${point.id}`}
                                                    checked={!!point.isResolved}
                                                    onCheckedChange={() => handleToggleImprovementResolved(point.id)}
                                                    aria-label={point.isResolved ? "Mark as unresolved" : "Mark as resolved"}
                                                    disabled={isUpdatingImpPointStatus[point.id]}
                                                />
                                                 <Label htmlFor={`resolve-switch-${point.id}`} className="text-xs text-muted-foreground">
                                                    {isUpdatingImpPointStatus[point.id] ? "Updating..." : (point.isResolved ? "Resolved" : "Resolve")}
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
                                                  disabled={isSubmittingImpComment[point.id]}
                                              />
                                              <Button
                                                  size="sm"
                                                  onClick={() => handleAddCommentToImprovement(point.id, improvementCommentInputs[point.id] || "")}
                                                  disabled={!(improvementCommentInputs[point.id] || "").trim() || isSubmittingImpComment[point.id]}
                                              >
                                                  <Send className="mr-2 h-3.5 w-3.5" /> 
                                                  {isSubmittingImpComment[point.id] ? "Posting..." : "Post Comment"}
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

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Store Operational Tasks</CardTitle>
              <CardDescription>Manage day-to-day tasks for this store.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ListFilter className="mr-2 h-4 w-4" /> Filter ({filteredStoreTasks.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={taskFilterStatus} onValueChange={(val) => setTaskFilterStatus(val as StoreTask['status'] | "All")}>
                    <DropdownMenuRadioItem value="All">All Statuses</DropdownMenuRadioItem>
                    {allStoreTaskStatuses.map(status => (
                       <DropdownMenuRadioItem key={status} value={status}>{status}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStoreTasks.length > 0 ? (
              <ScrollArea className="max-h-[500px] pr-3">
                <ul className="space-y-4">
                  {filteredStoreTasks.map(task => (
                    <li key={task.id} className="p-4 border rounded-lg shadow-sm bg-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-md">{task.title}</h4>
                          {task.description && <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{task.description}</p>}
                        </div>
                         {canManageStoreFeatures && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isSubmittingStoreTask}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenEditTaskDialog(task)} disabled={isSubmittingStoreTask}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     {allStoreTaskStatuses.map(status => (
                                        <DropdownMenuItem key={status} onClick={() => handleUpdateStoreTaskStatus(task.id, status)} disabled={task.status === status || isSubmittingStoreTask}>
                                            {task.status === status ? <Check className="mr-2 h-4 w-4 text-primary" /> : <div className="w-6 mr-2"/>}
                                            Mark as {status}
                                        </DropdownMenuItem>
                                     ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeleteStoreTask(task.id)} className="text-destructive focus:text-destructive" disabled={isSubmittingStoreTask}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          <Badge variant={statusBadgeVariant(task.status)} className={cn("ml-1", statusBadgeClass(task.status))}>
                            {task.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority: </span>
                          <Badge variant={priorityBadgeVariant(task.priority)} className="ml-1">
                            {task.priority || "None"}
                          </Badge>
                        </div>
                        {task.assignedTo && <div><span className="text-muted-foreground">Assigned: </span>{task.assignedTo}</div>}
                        {task.dueDate && <div><span className="text-muted-foreground">Due: </span>{isValid(new Date(task.dueDate)) ? format(new Date(task.dueDate), "PP") : "Invalid Date"}</div>}
                        <div><span className="text-muted-foreground">By: </span>{task.createdBy}</div>
                        <div><span className="text-muted-foreground">Added: </span>{isValid(new Date(task.createdAt)) ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : "Invalid Date"}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks match the current filter. {taskFilterStatus === "All" && canManageStoreFeatures && "Try adding a new task!"}
              </p>
            )}
          </CardContent>
        </Card>

      </div>

      
      <Dialog open={isAddTaskDialogOpen || isEditTaskDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsAddTaskDialogOpen(false);
            setIsEditTaskDialogOpen(false);
            setEditingStoreTask(null);
            setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" });
          } else {
            if (editingStoreTask) setIsEditTaskDialogOpen(true); else setIsAddTaskDialogOpen(true);
          }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingStoreTask ? "Edit Store Task" : "Add New Store Task"}</DialogTitle>
            <DialogDescription>
              {editingStoreTask ? "Update the details of this operational task." : "Fill in the details for the new store task."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title *</Label>
              <Input id="task-title" value={newTaskForm.title} onChange={(e) => handleNewTaskFormChange('title', e.target.value)} placeholder="e.g., Morning Cleaning Checklist" disabled={isSubmittingStoreTask}/>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-description">Description</Label>
              <Textarea id="task-description" value={newTaskForm.description} onChange={(e) => handleNewTaskFormChange('description', e.target.value)} placeholder="Optional: provide more details..." rows={3} disabled={isSubmittingStoreTask}/>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="task-assignedTo">Assigned To</Label>
                  <Input id="task-assignedTo" value={newTaskForm.assignedTo} onChange={(e) => handleNewTaskFormChange('assignedTo', e.target.value)} placeholder="e.g., Store Manager, Shift Lead" disabled={isSubmittingStoreTask}/>
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select value={newTaskForm.priority} onValueChange={(value) => handleNewTaskFormChange('priority', value as TaskPriority)} disabled={isSubmittingStoreTask}>
                        <SelectTrigger id="task-priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                        {allStoreTaskPriorities.map(prio => (
                            <SelectItem key={prio} value={prio}>{prio}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !newTaskForm.dueDate && "text-muted-foreground")}
                    disabled={isSubmittingStoreTask}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskForm.dueDate ? format(newTaskForm.dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={newTaskForm.dueDate} onSelect={(date) => handleNewTaskFormChange('dueDate', date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmittingStoreTask}>Cancel</Button>
            </DialogClose>
            <Button onClick={editingStoreTask ? handleSaveEditedStoreTask : handleSaveNewStoreTask} disabled={!newTaskForm.title.trim() || isSubmittingStoreTask}>
              {isSubmittingStoreTask ? "Saving..." : (editingStoreTask ? "Save Changes" : "Add Task")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

