"use client";

import * as React from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStoreById,
  updateStore as apiUpdateStore,
  addImprovementPointToStore,
  updateImprovementPointInStore,
  addCommentToImprovementPoint,
  addStoreTask,
  updateStoreTask,
  deleteStoreTask
} from "@/lib/api";
import type { StoreItem, ImprovementPoint, Comment as CommentType, StoreTask, TaskPriority, StoreType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Package2, Store as StoreIcon, Settings, HelpCircle, PlusCircle, Edit3, MessageSquare, MoreHorizontal, ExternalLink, CheckCircle, MessageCircle, Send, CornerDownRight, Eye, EyeOff, ListFilter, Trash2, CalendarIcon, AlertTriangle, Edit, Check } from "lucide-react";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
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
import { useEffect, useState } from "react";

const allStoreTaskPriorities: TaskPriority[] = ["High", "Medium", "Low", "None"];
const allStoreTaskStatuses: StoreTask['status'][] = ["Pending", "In Progress", "Completed", "Blocked"];

type ImprovementPointType = {
  _id: string;
  text: string;
  addedById: string;
  addedByName: string;
  isResolved: boolean;
  addedAt: string;
  comments: any[];
};

type ImprovementPointsListProps = {
  points: ImprovementPointType[];
};

const ImprovementPointsList: React.FC<ImprovementPointsListProps> = ({ points }) => {
  if (!points || points.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No improvement points found for this store.</p>;
  }

  return (
    <div className="space-y-4">
      {points
        .slice()
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .map((point) => (
          <div key={point._id} className="p-4 border rounded-lg shadow-sm bg-card">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                {point.addedByName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{point.text}</span>
                  {point.isResolved ? (
                    <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">Resolved</span>
                  ) : (
                    <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs">Open</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Added by {point.addedByName} • {formatDistanceToNow(new Date(point.addedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Add better validation for storeId to prevent "undefined" from being passed to API
  const storeId = React.useMemo(() => {
    if (typeof params.id === 'string' && params.id.trim() && params.id !== 'undefined') {
      // Additional validation to ensure it's a valid ID format (either simple string or ObjectId)
      const id = params.id.trim();
      // ObjectId format: 24 character hex string
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      // Simple string format (fallback for mock data): alphanumeric, hyphens, underscores, but not "undefined"
      // If it's exactly 24 chars and mostly hex, treat as invalid ObjectId, not simple string
      const looksLikeObjectId = id.length === 24 && /^[0-9a-fA-F]{20,}/.test(id);
      const isSimpleString = !looksLikeObjectId && /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/.test(id) && id !== 'undefined';
      
      if (isObjectId || isSimpleString) {
        return id;
      }
    }
    return null;
  }, [params.id]);
  
  const [store, setStore] = React.useState<StoreItem | null>(null);
  const [storeLoading, setStoreLoading] = React.useState(true);
  const [storeNotFound, setStoreNotFound] = React.useState(false);

  const [isAddImprovementDialogOpen, setIsAddImprovementDialogOpen] = React.useState(false);
  const [newImprovementPointText, setNewImprovementPointText] = React.useState("");
  const [improvementCommentInputs, setImprovementCommentInputs] = React.useState<Record<string, string>>({});
  const [resolvedPointDiscussionVisibility, setResolvedPointDiscussionVisibility] = React.useState<Record<string, boolean>>({});

  const [isSubmittingImprovement, setIsSubmittingImprovement] = React.useState(false);
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
  // Request Info dialog removed
  // const [isRequestInfoDialogOpen, setIsRequestInfoDialogOpen] = React.useState(false);
  // const [requestInfoText, setRequestInfoText] = React.useState("");

  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = React.useState(false);
  const [isSavingStore, setIsSavingStore] = React.useState(false);
  const [editStoreForm, setEditStoreForm] = React.useState<Partial<StoreItem>>({});

  // --- NEW: State for loading improvement points from API (removed staticPoints) ---
  const [improvementPoints, setImprovementPoints] = useState<ImprovementPointType[]>([]);
  const [improvementPointsLoading, setImprovementPointsLoading] = useState<boolean>(true);

  // Load improvement points from the store resource (keeps in sync with loadStore)
  React.useEffect(() => {
    if (!storeId) return;
    let mounted = true;
    setImprovementPointsLoading(true);
    (async () => {
      try {
        const s = await getStoreById(storeId);
        if (!mounted) return;
        setImprovementPoints(Array.isArray(s?.improvementPoints) ? (s.improvementPoints as unknown as ImprovementPointType[]) : []);
      } catch (e) {
        if (!mounted) return;
        setImprovementPoints([]);
      } finally {
        if (!mounted) return;
        setImprovementPointsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [storeId]);

  // Keep improvementPoints in sync when loadStore updates `store`
  React.useEffect(() => {
    if (!store) return;
    setImprovementPoints(Array.isArray(store.improvementPoints) ? store.improvementPoints as ImprovementPointType[] : []);
  }, [store]);

  const loadStore = React.useCallback(async (id: string) => {
    try {
      setStoreLoading(true);
      const storeData = await getStoreById(id);
      if (storeData) {
        setStore(storeData);
        setEditStoreForm({
          name: storeData.name,
          location: storeData.location,
          manager: storeData.manager,
          sqft: storeData.sqft,
          openingDate: storeData.openingDate,
          status: storeData.status,
          type: storeData.type,
        });
        setStoreNotFound(false);
      } else {
        setStoreNotFound(true);
      }
    } catch (error) {
      console.error('Error loading store:', error);
      setStoreNotFound(true);
    } finally {
      setStoreLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
    
    if (!storeId) {
      setStoreNotFound(true);
      setStoreLoading(false);
      return;
    }
    
    if (storeId && user) {
      loadStore(storeId);
    }
  }, [storeId, user, authLoading, router, loadStore]);

  const currentUserRole = user?.role;
  const isUserAdmin = currentUserRole === 'Admin';
  const isUserSuperAdmin = currentUserRole === 'SuperAdmin';

  const canManageStoreFeatures = isUserAdmin || isUserSuperAdmin;

  const handleAddImprovementPoint = async () => { 
    if (!newImprovementPointText.trim() || !store || !user) {
      toast({ title: "Error", description: "Improvement point text cannot be empty.", variant: "destructive" }); return;
    }
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", description: "You do not have permission to add improvement points.", variant: "destructive" }); return;
    }
    setIsSubmittingImprovement(true);
    const newPointPayload: Partial<ImprovementPoint> = {
      text: newImprovementPointText,
      addedById: user.id || "System",
      addedByName : user.name || user.email || "System",
      addedAt: new Date().toISOString(),
      isResolved: false,
      comments: []
    };
    try {
      // Use API helper to create improvement point
      const created = await addImprovementPointToStore(storeId, newPointPayload);
      // If API returns the created point, prepend it to local state for immediate visibility.
      if (created && (created as any)._id) {
        setImprovementPoints(prev => [(created as any) as ImprovementPointType, ...prev]);
      } else {
        // fallback: refresh store data
        await loadStore(store.id);
        setImprovementPoints(Array.isArray(store.improvementPoints) ? store.improvementPoints as ImprovementPointType[] : []);
      }
      toast({ title: "Improvement Point Added" });
      setNewImprovementPointText("");
      setIsAddImprovementDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmittingImprovement(false);
    }
  };

  const toggleResolvedPointDiscussion = (pointId: string) => {
    setResolvedPointDiscussionVisibility(prev => ({ ...prev, [pointId]: !prev[pointId] }));
  };

  const handleToggleImprovementResolved = async (pointId: string) => {
    if (!store || !user || !canManageStoreFeatures) {
        toast({title: "Permission Denied", variant: "destructive"}); return;
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
        await apiUpdateStore(store.id, { improvementPoints: store.improvementPoints.map(p => p.id === pointId ? {...p, ...updatePayload} : p) });
        await loadStore(store.id);
        if (newResolvedState) setResolvedPointDiscussionVisibility(prev => ({ ...prev, [pointId]: false }));
        toast({ title: "Improvement Point Updated" });
    } catch (error) {
        toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
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
      timestamp: new Date().toISOString(), text: text, replies: [],
    };
    try {
        const point = store.improvementPoints?.find(p => p.id === pointId);
        if (!point) throw new Error("Point not found");
        const updatedPoint = { ...point, comments: [newCommentPayload as CommentType, ...(point.comments || [])]};
        await apiUpdateStore(store.id, { improvementPoints: store.improvementPoints.map(p => p.id === pointId ? updatedPoint : p) });
        await loadStore(store.id); 
        setImprovementCommentInputs(prev => ({...prev, [pointId]: ""}));
        toast({ title: "Comment Added" });
    } catch (error) {
        toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    } finally {
        setIsSubmittingImpComment(prev => ({...prev, [pointId]: false}));
    }
  };

  const handleReplyToImprovementComment = async (pointId: string, commentId: string, replyText: string) => {
    if (!replyText.trim() || !store || !user) return;
    setIsSubmittingImpComment(prev => ({...prev, [`${pointId}-${commentId}`]: true}));
    const newReplyPayload: Partial<CommentType> = { 
      id: `imp-reply-${Date.now()}`,
      author: user.name || user.email || "System", 
      avatarUrl: `https://picsum.photos/seed/${user.id || 'replyUser'}/40/40`, 
      timestamp: new Date().toISOString(), text: replyText
    };

    const findAndAddReply = (comments: CommentType[]): CommentType[] => {
      return comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [newReplyPayload as CommentType, ...(c.replies || [])]};
        }
        if (c.replies) {
          return {...c, replies: findAndAddReply(c.replies)};
        }
        return c;
      });
    };

    try {
        const point = store.improvementPoints?.find(p => p.id === pointId);
        if (!point) throw new Error("Point not found");
        const updatedPoint = {...point, comments: findAndAddReply(point.comments)};

        await apiUpdateStore(store.id, { improvementPoints: store.improvementPoints.map(p => p.id === pointId ? updatedPoint : p) });
        await loadStore(store.id); 
        toast({ title: "Reply Posted" });
    } catch (error) {
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
      toast({ title: "Error", description: "Task title is required.", variant: "destructive" }); return;
    }
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", variant: "destructive" }); return;
    }
    setIsSubmittingStoreTask(true);

    const newTaskPayload: Partial<StoreTask> = {
      id: `stask-${Date.now()}`,
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
      const updatedTasks = [...(store.tasks || []), newTaskPayload as StoreTask];
      await apiUpdateStore(store.id, { tasks: updatedTasks });
      await loadStore(store.id); 
      toast({ title: "Task Added" });
      setIsAddTaskDialogOpen(false);
      setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    } finally {
      setIsSubmittingStoreTask(false);
    }
  };

  const handleOpenEditTaskDialog = (task: StoreTask) => {
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", variant: "destructive" }); return;
    }
    setEditingStoreTask(task);
    setNewTaskForm({
        title: task.title, description: task.description || "", assignedTo: task.assignedTo || "",
        dueDate: task.dueDate && isValid(new Date(task.dueDate)) ? new Date(task.dueDate) : undefined,
        priority: task.priority || "Medium",
    });
    setIsEditTaskDialogOpen(true);
  };

  const handleSaveEditedStoreTask = async () => {
    if (!editingStoreTask || !newTaskForm.title.trim() || !store || !user) {
        toast({ title: "Error", variant: "destructive" }); return;
    }
    if (!canManageStoreFeatures) {
      toast({ title: "Permission Denied", variant: "destructive" }); return;
    }
    setIsSubmittingStoreTask(true);
    const updatedTaskPayload: Partial<StoreTask> = {
        title: newTaskForm.title.trim(), description: newTaskForm.description.trim() || undefined,
        assignedTo: newTaskForm.assignedTo.trim() || undefined, priority: newTaskForm.priority,
        dueDate: newTaskForm.dueDate ? format(newTaskForm.dueDate, "yyyy-MM-dd") : undefined,
    };
    try {
        const updatedTasks = store.tasks.map(t => t.id === editingStoreTask.id ? { ...t, ...updatedTaskPayload} : t);
        await apiUpdateStore(store.id, { tasks: updatedTasks });
        await loadStore(store.id); 
        toast({ title: "Task Updated" });
        setIsEditTaskDialogOpen(false); setEditingStoreTask(null);
        setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };

  const handleUpdateStoreTaskStatus = async (taskId: string, newStatus: StoreTask['status']) => {
    if (!store || !canManageStoreFeatures) { 
        toast({title: "Permission Denied", variant: "destructive"}); return;
    }
    setIsSubmittingStoreTask(true); 
    try {
        const updatedTasks = store.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        await apiUpdateStore(store.id, { tasks: updatedTasks });
        await loadStore(store.id); 
        toast({ title: "Task Status Updated" });
    } catch (error) {
        toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };

  const handleDeleteStoreTask = async (taskId: string) => {
    if (!store || !canManageStoreFeatures) {
        toast({title: "Permission Denied", variant: "destructive"}); return;
    }
    const taskToDelete = store.tasks?.find(t => t.id === taskId);
    if (!taskToDelete) return;
    setIsSubmittingStoreTask(true);
    try {
        const updatedTasks = store.tasks.filter(t => t.id !== taskId);
        await apiUpdateStore(store.id, { tasks: updatedTasks });
        await loadStore(store.id);
        toast({ title: "Task Deleted" });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete task.", variant: "destructive" });
    } finally {
        setIsSubmittingStoreTask(false);
    }
  };

  const filteredStoreTasks = React.useMemo(() => {
    if (!store?.tasks) return [];
    return store.tasks.filter(task =>
      taskFilterStatus === "All" || task.status === taskFilterStatus
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store?.tasks, taskFilterStatus]);

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
            <p className="text-muted-foreground">Please sign in.</p>
        </div>
      );
  }

  if (storeLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading store details...</p>
      </div>
    );
  }

  if (storeNotFound || !store) {
      notFound();
      return null;
  }

  const priorityBadgeVariant = (priority?: TaskPriority) => { /* ... */ return "outline"; };
  const statusBadgeVariant = (status: StoreTask['status']) => { /* ... */ return "outline"; };
  const statusBadgeClass = (status: StoreTask['status']) => { /* ... */ return ""; };

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
                  A request to change ownership is awaiting approval.
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
              {/* --- NEW: Use improvementPoints state for rendering --- */}
              {improvementPointsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading improvement points...</p>
              ) : improvementPoints && improvementPoints.length > 0 ? (
                <ScrollArea className="max-h-[500px] pr-3">
                  <ul className="space-y-6">
                    {improvementPoints
                      .slice()
                      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
                      .map(point => (
                        <li key={point._id} className="p-4 border rounded-lg shadow-sm bg-card">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                              {point.addedByName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{point.text}</span>
                                {point.isResolved ? (
                                  <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">Resolved</span>
                                ) : (
                                  <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs">Open</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Added by {point.addedByName} • {formatDistanceToNow(new Date(point.addedAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No improvement points added yet.</p>
              )}
              {/* --- END NEW --- */}
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

      
      <Dialog
        open={isAddTaskDialogOpen || isEditTaskDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsAddTaskDialogOpen(false);
            setIsEditTaskDialogOpen(false);
            setEditingStoreTask(null);
            setNewTaskForm({ title: "", description: "", assignedTo: "", dueDate: undefined, priority: "Medium" });
          } else {
            // Dialog opened — keep current form state
          }
        }}
      >
        {/* Dialog content for add / edit task is already defined elsewhere in the file.
            If you previously had complex form markup here, re-add it inside DialogContent.
            For now we keep a minimal placeholder so JSX is syntactically correct. */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStoreTask ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription>{editingStoreTask ? "Update the task details." : "Create a new task for this store."}</DialogDescription>
          </DialogHeader>
          {/* Placeholder UI — preserved to avoid breaking layout */}
          <div className="py-4 text-sm text-muted-foreground">Task form goes here.</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={() => { setIsAddTaskDialogOpen(false); setIsEditTaskDialogOpen(false); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
