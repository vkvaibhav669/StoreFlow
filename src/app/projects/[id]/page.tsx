
"use client";

import * as React from "react";
import { notFound, useRouter, useParams as useParamsNext } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addDocumentToProject,
  addCommentToProject,
  addReplyToProjectComment,
  addMemberToProject,
  removeMemberFromProject,
  mockHeadOfficeContacts
} from "@/lib/data";
import { getProjectById, updateProject, createTask, updateTask } from "@/lib/api";
import { useProjectComments, useTaskComments } from "@/hooks/useComments";
import type { Task, DocumentFile, Comment, StoreProject, Department, DepartmentDetails, TaskPriority, User, StoreType, Milestone, Blocker, ProjectMember, UserRole } from "@/types";
import { ArrowLeft, CalendarDays, CheckCircle, FileText, Landmark, Milestone as MilestoneIcon, Paintbrush, Paperclip, PlusCircle, Target, Users as UsersIcon, Volume2, Clock, UploadCloud, MessageSquare, ShieldCheck, ListFilter, Building, ExternalLink, Edit, Trash2, AlertTriangle, GripVertical, Eye, EyeOff, UserPlus, UserX, Crown, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatDate as utilFormatDate, addDays as utilAddDays } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { CommentCard } from "@/components/comments/CommentCard";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Package2, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { isValidObjectId } from "@/lib/mongodb";
import { ObjectId } from "mongodb";


interface DepartmentCardProps {
  title: string;
  icon: React.ElementType<React.ComponentPropsWithoutRef<'svg'>>;
  tasks: Task[];
  notes?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  isLockedForCurrentUser?: boolean;
}

function DepartmentCard({ title, icon: Icon, tasks, notes, children, onClick, isLockedForCurrentUser }: DepartmentCardProps) {
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeTasksToList = tasks.filter(task => task.status === 'Pending' || task.status === 'In Progress');
  const effectiveOnClick = isLockedForCurrentUser ? undefined : onClick;

  return (
    <Card onClick={effectiveOnClick} className={cn(effectiveOnClick ? "cursor-pointer hover:shadow-lg transition-shadow" : "", isLockedForCurrentUser && "opacity-75 bg-muted/50")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
          {isLockedForCurrentUser && <Lock className="h-4 w-4 text-muted-foreground" aria-label="Access restricted" />}
        </CardTitle>
        {!isLockedForCurrentUser && totalTasks > 0 && (
          <CardDescription>{completedTasks} of {totalTasks} tasks completed.</CardDescription>
        )}
         {isLockedForCurrentUser && <CardDescription>Access restricted.</CardDescription>}
      </CardHeader> 
      <CardContent className="space-y-3">
        {!isLockedForCurrentUser && totalTasks > 0 && <Progress value={progress} className="h-2" />}
        {!isLockedForCurrentUser && notes && <p className="text-sm text-muted-foreground italic">{notes}</p>}
        {!isLockedForCurrentUser && children}
        {!isLockedForCurrentUser && activeTasksToList.length > 0 && (
          <ul className="space-y-1 text-sm">
            {activeTasksToList.slice(0, 3).map(task => (
              <li key={task.id} className="flex items-center justify-between">
                <span className={task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{task.name}</span>
                <Badge variant={task.status === 'Completed' ? 'outline' : 'secondary'} className="text-xs">
                  {task.status}
                </Badge>
              </li>
            ))}
            {activeTasksToList.length > 3 && <li className="text-xs text-muted-foreground text-center">+{activeTasksToList.length - 3} more active tasks</li>}
          </ul>
        )}
        {!isLockedForCurrentUser && activeTasksToList.length === 0 && tasks.length > 0 && !children && <p className="text-sm text-muted-foreground">No active (Pending/In Progress) tasks for this department.</p>}
        {!isLockedForCurrentUser && tasks.length === 0 && !children && <p className="text-sm text-muted-foreground">No tasks for this department yet.</p>}
        {isLockedForCurrentUser && <p className="text-sm text-muted-foreground text-center py-2">Details for this department are restricted for your role or project assignment.</p>}
      </CardContent>
    </Card>
  );
}

const allPossibleDepartments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations" , "Visual Merchandising"];
const allPossibleTaskPriorities: TaskPriority[] = ["High", "Medium", "Low", "None"];
const propertyStatuses = ["Identified", "Negotiating", "Finalized"] as const;
const storeTypes: StoreType[] = ["COCO", "FOFO"];
const projectStatuses: StoreProject['status'][] = [
  "Planning", "Property Finalized", "Project Kickoff", "Execution",
  "Merchandising", "Recruitment", "Pre-Launch Marketing", "Launched", "Post-Launch Marketing"
];

export default function ProjectDetailsPage() {
  const paramsHook = useParamsNext();
  // Add better validation for projectId to prevent "undefined" from being passed to API
  const projectId = React.useMemo(() => {
    if (typeof paramsHook.id === 'string' && paramsHook.id.trim() && paramsHook.id !== 'undefined') {
      // Additional validation to ensure it's a valid ID format (either simple string or ObjectId)
      const id = paramsHook.id.trim();
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
  }, [paramsHook.id]);
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [projectData, setProjectData] = React.useState<StoreProject | null>(null);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  // Use the new real-time comment hook
  const { 
    comments: projectComments, 
    isLoading: commentsLoading, 
    addComment: addProjectComment,
    error: commentsError 
  } = useProjectComments(projectData?.id || null);

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = React.useState(false);
  const [newTaskName, setNewTaskName] = React.useState("");
  const [newTaskDepartment, setNewTaskDepartment] = React.useState<Department | "">("");
  const [newTaskDescription, setNewTaskDescription] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState<TaskPriority>("Medium");

  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = React.useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = React.useState(false);
  const [newDocumentFile, setNewDocumentFile] = React.useState<File | null>(null);
  const [newDocumentName, setNewDocumentName] = React.useState("");
  const [newDocumentType, setNewDocumentType] = React.useState<DocumentFile['type'] | "">("");
  const [newDocumentDataAiHint, setNewDocumentDataAiHint] = React.useState("");
  const [newDocumentHodOnly, setNewDocumentHodOnly] = React.useState(false);

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  
  // Task comment hooks for the selected task (must be after selectedTask is declared)
  const { 
    comments: taskComments, 
    isLoading: taskCommentsLoading, 
    addComment: addTaskComment,
    error: taskCommentsError 
  } = useTaskComments(selectedTask?.id || null);
  const [isViewTaskDialogOpen, setIsViewTaskDialogOpen] = React.useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = React.useState(false);
  const [editingTaskStatus, setEditingTaskStatus] = React.useState<Task['status'] | "">("");
  const [editingTaskAssignedTo, setEditingTaskAssignedTo] = React.useState<string>("");
  const [editingSelectedTaskDepartment, setEditingSelectedTaskDepartment] = React.useState<Department | "">("");
  const [editingSelectedTaskPriority, setEditingSelectedTaskPriority] = React.useState<TaskPriority | "">("");
  const [newTaskCommentTextForTask, setNewTaskCommentTextForTask] = React.useState("");
  const [isSubmittingTaskComment, setIsSubmittingTaskComment] = React.useState(false);

  const [isDepartmentTasksDialogOpen, setIsDepartmentTasksDialogOpen] = React.useState(false);
  const [departmentDialogTitle, setDepartmentDialogTitle] = React.useState("");
  const [departmentDialogTasks, setDepartmentDialogTasks] = React.useState<Task[]>([]);

  const [taskFilterPriority, setTaskFilterPriority] = React.useState<TaskPriority | "All">("All");

  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = React.useState(false);
  const [isSavingProject, setIsSavingProject] = React.useState(false);
  
  const [editingProjectForm, setEditingProjectForm] = React.useState<Partial<StoreProject>>({});
  const [editingPropertyDetailsForm, setEditingPropertyDetailsForm] = React.useState<Partial<StoreProject['propertyDetails']>>({});
  const [editingTimelineForm, setEditingTimelineForm] = React.useState<Partial<StoreProject['projectTimeline']>>({});
  const [editingMilestones, setEditingMilestones] = React.useState<Milestone[]>([]);
  const [editingBlockers, setEditingBlockers] = React.useState<Blocker[]>([]);
  
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] = React.useState(false);
  const [newMilestoneName, setNewMilestoneName] = React.useState("");
  const [newMilestoneDate, setNewMilestoneDate] = React.useState(utilFormatDate(new Date()));
  const [newMilestoneDescription, setNewMilestoneDescription] = React.useState("");

  const [isAddBlockerDialogOpen, setIsAddBlockerDialogOpen] = React.useState(false);
  const [newBlockerTitle, setNewBlockerTitle] = React.useState("");
  const [newBlockerDescription, setNewBlockerDescription] = React.useState("");

  const [showBlockersInTimeline, setShowBlockersInTimeline] = React.useState(false);

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = React.useState(false);
  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [availableHOContacts] = React.useState<ProjectMember[]>(mockHeadOfficeContacts);
  const [selectedNewMemberEmail, setSelectedNewMemberEmail] = React.useState<string>("");
  const [newMemberRoleInProject, setNewMemberRoleInProject] = React.useState("");
  const [newMemberIsProjectHod, setNewMemberIsProjectHod] = React.useState(false);

  const [isConfirmRemoveMemberDialogOpen, setIsConfirmRemoveMemberDialogOpen] = React.useState(false);
  const [isRemovingMember, setIsRemovingMember] = React.useState(false);
  const [memberToRemoveInfo, setMemberToRemoveInfo] = React.useState<{ email: string, name: string, role?: UserRole } | null>(null);

  React.useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    if (!projectId) {
      // This might happen if the URL is malformed or ID is not a string
      notFound();
      return;
    }

    // Fetch project data asynchronously
    const fetchProject = async () => {
      try {
        const currentProject = await getProjectById(projectId);
        if (currentProject) {
            setProjectData(currentProject);
            // Comments are now handled by the useProjectComments hook
            setEditingProjectForm({
                name: currentProject.name, location: currentProject.location, status: currentProject.status,
                startDate: currentProject.startDate ? utilFormatDate(new Date(currentProject.startDate)) : "",
                projectedLaunchDate: currentProject.projectedLaunchDate ? utilFormatDate(new Date(currentProject.projectedLaunchDate)) : "",
                franchiseType: currentProject.franchiseType, threeDRenderUrl: currentProject.threeDRenderUrl,
            });
            setEditingPropertyDetailsForm(currentProject.propertyDetails || {});
            setEditingTimelineForm(currentProject.projectTimeline || {});
            setEditingMilestones(currentProject.milestones ? currentProject.milestones.map(m => ({...m})) : []);
            setEditingBlockers(currentProject.blockers ? currentProject.blockers.map(b => ({...b})) : []);
        } else {
            notFound(); // Project with this ID not found
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        notFound(); // Handle fetch errors by showing not found
      }
    };

    fetchProject();
  }, [projectId, user, authLoading, router]);


  const currentUserRole = user?.role;
  const isUserSuperAdmin = currentUserRole === 'SuperAdmin';
  const isUserAdmin = currentUserRole === 'Admin';
  const isUserMember = currentUserRole === 'Member';

  const canEditProject = isUserSuperAdmin || isUserAdmin;
  const canManageAnyMember = isUserSuperAdmin || isUserAdmin;

  const currentUserProjectMembership = React.useMemo(() => {
    if (!user || !projectData?.members) return undefined;
    return projectData.members.find(m => m.email === user.email);
  }, [user, projectData?.members]);

  const visibleFiles = React.useMemo(() => {
    if (!projectData) return [];
    if (isUserAdmin || isUserSuperAdmin) return projectData.documents;
    if (isUserMember) return projectData.documents.filter(doc => !doc.hodOnly);
    return projectData.documents.filter(doc => !doc.hodOnly);
  }, [projectData, isUserAdmin, isUserSuperAdmin, isUserMember]);

  const filteredTasksForTable = React.useMemo(() => {
    if (!projectData || !projectData.tasks) return [];
    let tasksToFilter = projectData.tasks;

    if (isUserMember) {
      if (currentUserProjectMembership && currentUserProjectMembership.department) {
        tasksToFilter = projectData.tasks.filter(
          task => task.department === currentUserProjectMembership.department
        );
      } else {
        return []; 
      }
    }

    if (taskFilterPriority === "All") {
      return tasksToFilter;
    }
    return tasksToFilter.filter(task => task.priority === taskFilterPriority);
  }, [projectData, taskFilterPriority, isUserMember, currentUserProjectMembership]);

  const availableMembersToAdd = React.useMemo(() => {
    if (!projectData || !availableHOContacts.length) return [];
    const currentMemberEmails = (projectData.members || []).map(m => m.email);
    return availableHOContacts.filter(contact => !currentMemberEmails.includes(contact.email));
  }, [projectData, availableHOContacts]);

  if (authLoading || (user && !projectData && projectId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Authenticating..." : "Loading project details..."}</p>
      </div>
    );
  }

   if (!user && !authLoading) { // If not loading and no user, redirect should have happened
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
          <p className="text-muted-foreground">Please sign in to view project details.</p> {/* This line was causing the error */}
          <Button onClick={() => router.push('/auth/signin')} className="mt-4">Sign In</Button>
      </div>
    );
  }
  
  if (!projectData) {
    // This case should be covered by the useEffect calling notFound() if projectId is valid but project not found.
    // Or if projectId itself was invalid from the start.
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
           <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
           <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
           <p className="text-muted-foreground mb-6">Loading project data or project does not exist.</p>
           <Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
        </div>
    );
  }

  const handleAddNewTask = async () => {
    if (!newTaskName || !newTaskDepartment || !newTaskAssignedTo) {
      toast({ title: "Error", description: "Task Name, Department, and Assignee are required.", variant: "destructive" });
      return;
    }
    if (isUserMember) {
        toast({ title: "Permission Denied", description: "Members cannot assign new tasks.", variant: "destructive"});
        return;
    }
    if (!projectData) return;

    setIsSubmittingTask(true);
    const newTaskPayload: Partial<Task> = {
      name: newTaskName,
      department: newTaskDepartment as Department,
      description: newTaskDescription || undefined,
      dueDate: newTaskDueDate || undefined,
      priority: newTaskPriority,
      status: "Pending",
      assignedTo: newTaskAssignedTo,
      comments: [],
    };

    try {
      const addedTask = await createTask(projectData.id, newTaskPayload);
      // Refresh project data asynchronously
      const refreshedProject = await getProjectById(projectData.id);
      setProjectData(refreshedProject || null);
      toast({ title: "Task Added", description: `Task "${addedTask.name}" has been added.` });
      setNewTaskName(""); setNewTaskDepartment(""); setNewTaskDescription("");
      setNewTaskDueDate(""); setNewTaskAssignedTo(""); setNewTaskPriority("Medium");
      setIsAddTaskDialogOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocumentFile(file);
      setNewDocumentName(file.name);
    }
  };

  const handleAddNewDocument = async () => {
    if (!newDocumentFile || !newDocumentName || !newDocumentType) {
      toast({ title: "Error", description: "File, Document Name, and Document Type are required.", variant: "destructive" });
      return;
    }
    if (!projectData || !user) return;

    setIsSubmittingDocument(true);
    const formData = new FormData(); 
    formData.append('file', newDocumentFile);
    formData.append('name', newDocumentName);
    formData.append('type', newDocumentType);
    formData.append('uploadedBy', user.name || user.email || "System");
    formData.append('dataAiHint', newDocumentType === "3D Render" ? (newDocumentDataAiHint || "abstract design") : "");
    formData.append('hodOnly', String(newDocumentHodOnly));

    try {
      const addedDocument = addDocumentToProject(projectData.id, formData);
      // Refresh project data asynchronously
      const refreshedProject = await getProjectById(projectData.id);
      setProjectData(refreshedProject || null);
      toast({ title: "Document Added", description: `Document "${addedDocument.name}" has been uploaded.` });
      setNewDocumentFile(null); setNewDocumentName(""); setNewDocumentType("");
      setNewDocumentDataAiHint(""); setNewDocumentHodOnly(false);
      setIsAddDocumentDialogOpen(false);
    } catch (error) {
      console.error("Error adding document:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to add document.", variant: "destructive" });
    } finally {
      setIsSubmittingDocument(false);
    }
  };

  const handleAddComment = async () => {
    if (newCommentText.trim() && projectData && user) {
      setIsSubmittingComment(true);
      const commentPayload = {
        author: user.name || user.email || "Anonymous User",
        text: newCommentText,
        authorId: user.id || user.email,
      };
      try {
        await addProjectComment(commentPayload);
        toast({ title: "Comment Posted", description: "Your comment has been added." });
        setNewCommentText("");
      } catch (error) {
        console.error("Error posting comment:", error);
        toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };
  
  const handleReplyToComment = async (commentId: string, replyText: string) => {
      if (!projectData || !user || !replyText.trim()) return;
      setIsSubmittingComment(true);

      const replyPayload: Partial<Comment> = {
          author: user.name || user.email || "Anonymous User",
          addedByName: user.name || user.email || "Anonymous User",
          addedById: user.id || user.email,
          avatarUrl: `https://picsum.photos/seed/${user.id || 'replyUser'}/40/40`,
          timestamp: new Date().toISOString(),
          addedAt: new Date().toISOString(),
          text: replyText,
          replies: [],
      };

      try {
          addReplyToProjectComment(projectData.id, commentId, replyPayload);
          const updatedProject = await getProjectById(projectData.id);
          setProjectData(updatedProject || null);
          // Comments are now handled by the real-time hook
          toast({ title: "Reply Posted", description: "Your reply has been added." });
      } catch (error) {
          console.error("Error posting reply:", error);
          toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
      } finally {
          setIsSubmittingComment(false);
      }
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setEditingTaskStatus(task.status);
    setEditingTaskAssignedTo(task.assignedTo || "");
    setEditingSelectedTaskDepartment(task.department);
    setEditingSelectedTaskPriority(task.priority || "Medium");
    setNewTaskCommentTextForTask("");
    setIsViewTaskDialogOpen(true);
  };

  const handleUpdateTaskDetails = async () => {
    if (!selectedTask || !projectData || !user) return;
    const taskIdToUpdate = selectedTask._id || selectedTask.id;
    console.log(selectedTask);
    // 1. Permission Check for members trying to change department or priority
    if (isUserMember) {
        const departmentChanged = (editingSelectedTaskDepartment as Department || selectedTask.department) !== selectedTask.department;
        const priorityChanged = (editingSelectedTaskPriority as TaskPriority || selectedTask.priority || "Medium") !== (selectedTask.priority || "Medium");
        if (departmentChanged || priorityChanged) {
             toast({ title: "Permission Denied", description: "Members cannot change task department or priority.", variant: "destructive"});
             return;
        }
    }

    setIsUpdatingTask(true);
    // 1. Validate the task ID format
  
    // 2. Prepare the payload with the updated data from the dialog form
    const taskUpdatePayload: Partial<Task> = {
      status: (editingTaskStatus as Task['status']) || selectedTask.status,
      assignedTo: editingTaskAssignedTo || selectedTask.assignedTo,
      department: (editingSelectedTaskDepartment as Department) || selectedTask.department,
      priority: (editingSelectedTaskPriority as TaskPriority) || selectedTask.priority || "Medium",
    };

    try {
      // 3. Invoke the PUT API call using the projectId and taskId.
      // The `updateTask` function is imported from `lib/api.ts` and handles the fetch request.      
      await updateTask(projectData.id, taskIdToUpdate , taskUpdatePayload);
      // 4. Re-fetch the entire project to ensure the UI is perfectly in sync with the database.
      // This is a robust strategy that ensures any changes to the task (e.g., status, department)
      // are reflected correctly across all components on the page (progress bars, department cards, etc.).
      const refreshedProject = await getProjectById(projectData.id);
      setProjectData(refreshedProject || null);
      setSelectedTask(refreshedProject?.tasks.find(t => t.id === selectedTask.id) || null);
      toast({ title: "Task Updated", description: `Task "${selectedTask.name}" has been updated.` });
      setIsViewTaskDialogOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    } finally {
      setIsUpdatingTask(false);
    }
   
};
  
  const handlePostNewTaskComment = async () => {
    if (!selectedTask || !newTaskCommentTextForTask.trim() || !user) return;
    setIsSubmittingTaskComment(true);
    
    const commentPayload = {
      author: user.name || user.email || "Anonymous User",
      text: newTaskCommentTextForTask,
      authorId: user.id || user.email,
    };

    try {
      await addTaskComment(commentPayload);
      setNewTaskCommentTextForTask("");
      toast({ title: "Comment Added to Task", description: "Your comment has been posted." });
    } catch (error) {
      console.error("Error posting task comment:", error);
      toast({ title: "Error", description: "Failed to post task comment.", variant: "destructive" });
    } finally {
      setIsSubmittingTaskComment(false);
    }
  };

const handleReplyToTaskComment = async (taskId: string, commentId: string, replyText: string) => {
    if (!projectData || !user || !replyText.trim()) return;
    setIsSubmittingTaskComment(true);

    const replyPayload: Partial<Comment> = {
        author: user.name || user.email || "Anonymous User",
        addedByName: user.name || user.email || "Anonymous User",
        addedById: user.id || user.email,
        avatarUrl: `https://picsum.photos/seed/${user.id || 'taskReplyUser'}/40/40`,
        timestamp: new Date().toISOString(),
        addedAt: new Date().toISOString(),
        text: replyText,
    };

    try {
        const projectToUpdate = await getProjectById(projectData.id);
        if (!projectToUpdate) throw new Error("Project not found");
        const taskToUpdate = projectToUpdate.tasks.find(t => t.id === taskId);
        if (!taskToUpdate || !taskToUpdate.comments) throw new Error("Task or task comments not found");

        const newReply: Comment = { 
          id: `taskreply-${Date.now()}`, 
          _id: `taskreply-${Date.now()}`,
          ...replyPayload 
        } as Comment;

        const addReplyFn = (comments: Comment[]): boolean => {
            for (let comment of comments) {
                const currentCommentId = comment.id || comment._id;
                if (currentCommentId === commentId) {
                    comment.replies = [newReply, ...(comment.replies || [])];
                    return true;
                }
                if (comment.replies && addReplyFn(comment.replies)) return true;
            }
            return false;
        };
        
        if (!addReplyFn(taskToUpdate.comments)) throw new Error("Parent comment for reply not found");

        updateProject(projectData.id, projectToUpdate);
        const updatedProject = await getProjectById(projectData.id);
        setProjectData(updatedProject || null);
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(updatedProject?.tasks.find(t => t.id === taskId) || null);
        }
        toast({ title: "Reply Posted", description: "Your reply has been added." });
    } catch (error) {
        console.error("Error posting reply to task comment:", error);
        toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    } finally {
        setIsSubmittingTaskComment(false);
    }
};

  const handleOpenDepartmentDialog = (title: string, departmentKey: Department | undefined, tasks: Task[] = []) => {
    if (isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== departmentKey)) {
        toast({ title: "Access Restricted", description: "You do not have permission to view details for this department.", variant: "default"});
        return;
    }
    setDepartmentDialogTitle(`${title} - Tasks`);
    setDepartmentDialogTasks(tasks);
    setIsDepartmentTasksDialogOpen(true);
  };

  const { departments = {} } = projectData;

  const handleEditProjectFieldChange = (field: keyof Partial<StoreProject>, value: any) => {
    setEditingProjectForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditPropertyDetailChange = (field: keyof StoreProject['propertyDetails'], value: any) => {
    setEditingPropertyDetailsForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditTimelineChange = (field: keyof StoreProject['projectTimeline'], value: any) => {
    setEditingTimelineForm(prev => ({...prev, [field]: value}));
  };

  const handleSaveProjectChanges = async () => {
    if (!projectData || !editingProjectForm.status || !canEditProject) {
      toast({ title: "Permission Denied or Error", description: "You do not have permission to edit this project, or there was an error.", variant: "destructive"});
      return;
    }
    setIsSavingProject(true);
    const projectUpdatePayload: Partial<StoreProject> = {
        ...editingProjectForm,
        status: editingProjectForm.status as StoreProject['status'],
        propertyDetails: {
            ...(projectData.propertyDetails || { address: '', sqft: 0, status: 'Identified' }),
            ...(editingPropertyDetailsForm || {}),
            sqft: Number(editingPropertyDetailsForm?.sqft) || projectData.propertyDetails?.sqft || 0,
        },
        projectTimeline: {
            ...(projectData.projectTimeline || { totalDays: 0, currentDay:0, kickoffDate: utilFormatDate(new Date()) }),
            ...(editingTimelineForm || {}),
            totalDays: Number(editingTimelineForm?.totalDays) || projectData.projectTimeline?.totalDays || 0,
        },
        milestones: editingMilestones,
        blockers: editingBlockers,
        startDate: editingProjectForm.startDate ? utilFormatDate(new Date(editingProjectForm.startDate)) : projectData.startDate,
        projectedLaunchDate: editingProjectForm.projectedLaunchDate ? utilFormatDate(new Date(editingProjectForm.projectedLaunchDate)) : projectData.projectedLaunchDate,
    };

    try {
      const updatedProject = updateProject(projectData.id, projectUpdatePayload);
      setProjectData(await updatedProject); 
      toast({ title: "Project Updated", description: `${(await updatedProject).name} has been successfully updated.` });
      setIsEditProjectDialogOpen(false);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleEditMilestoneFieldChange = (index: number, field: keyof Milestone, value: any) => {
    setEditingMilestones(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveNewMilestone = () => {
    if (!newMilestoneName.trim() || !newMilestoneDate.trim()) {
      toast({ title: "Missing Information", description: "Milestone name and date are required.", variant: "destructive" });
      return;
    }
    const newMilestone: Milestone = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      name: newMilestoneName, date: newMilestoneDate, completed: false,
      description: newMilestoneDescription.trim() || undefined,
    };
    setEditingMilestones(prev => [...prev, newMilestone].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewMilestoneName(""); setNewMilestoneDate(utilFormatDate(new Date())); setNewMilestoneDescription("");
    setIsAddMilestoneDialogOpen(false);
    toast({ title: "Milestone Ready", description: `"${newMilestone.name}" added to edit form. Save project to persist.` });
  };

  const handleSaveNewBlocker = () => {
    if (!newBlockerTitle.trim() || !user) {
      toast({ title: "Missing Information", description: "Blocker title is required.", variant: "destructive" }); return;
    }
    const newBlocker: Blocker = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, title: newBlockerTitle,
      description: newBlockerDescription.trim(), dateReported: utilFormatDate(new Date()),
      isResolved: false, reportedBy: user.name || user.email || "System",
    };
    setEditingBlockers(prev => [...prev, newBlocker].sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()));
    setNewBlockerTitle(""); setNewBlockerDescription(""); setIsAddBlockerDialogOpen(false);
    toast({ title: "Blocker Ready", description: `"${newBlocker.title}" added to edit form. Save project to persist.` });
  };

  const handleToggleTimelineBlockerResolution = async (blockerId: string) => {
    if (!projectData || !canEditProject) return;
    const currentProject = await getProjectById(projectData.id);
    if (!currentProject || !currentProject.blockers) return;

    const blockerIndex = currentProject.blockers.findIndex(b => b.id === blockerId);
    if (blockerIndex === -1) return;

    const updatedBlocker = {
        ...currentProject.blockers[blockerIndex],
        isResolved: !currentProject.blockers[blockerIndex].isResolved,
        dateResolved: !currentProject.blockers[blockerIndex].isResolved ? utilFormatDate(new Date()) : undefined
    };
    currentProject.blockers[blockerIndex] = updatedBlocker;
    
    try {
        updateProject(currentProject.id, { blockers: currentProject.blockers });
        const refreshedProject = await getProjectById(currentProject.id);
        setProjectData(refreshedProject || null);
        toast({ title: "Blocker Status Updated", description: `Blocker resolution status has been changed.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update blocker status.", variant: "destructive" });
    }
  };

  const handleRemoveTimelineBlocker = async (blockerId: string) => {
    if (!projectData || !canEditProject) return;
    const currentProject = await getProjectById(projectData.id);
    if (!currentProject || !currentProject.blockers) return;

    const updatedBlockers = (currentProject.blockers || []).filter(b => b.id !== blockerId);
    try {
        updateProject(currentProject.id, { blockers: updatedBlockers });
        const refreshedProject = await getProjectById(currentProject.id);
        setProjectData(refreshedProject || null);
        toast({ title: "Blocker Removed", description: `The blocker has been removed from the project.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to remove blocker.", variant: "destructive" });
    }
  };

  const handleAddProjectMember = async () => {
    if (!selectedNewMemberEmail || !projectData || !canEditProject || !user) {
      toast({ title: "Error or Permission Denied", description: "Please select a person to add, or you may not have permission.", variant: "destructive" });
      return;
    }
    const personToAdd = availableHOContacts.find(p => p.email === selectedNewMemberEmail);
    if (!personToAdd) {
      toast({ title: "Error", description: "Selected person not found in available contacts.", variant: "destructive" }); return;
    }
    setIsAddingMember(true);
    const memberPayload = {
      email: personToAdd.email, name: personToAdd.name, department: personToAdd.department,
      roleInProject: newMemberRoleInProject.trim() || "Team Member", isProjectHod: newMemberIsProjectHod,
      avatarSeed: personToAdd.avatarSeed || personToAdd.name.split(' ').map(n=>n[0]).join('').toLowerCase(),
    };
    try {
      addMemberToProject(projectData.id, memberPayload);
      const refreshedProject = await getProjectById(projectData.id);
      setProjectData(refreshedProject || null);
      toast({ title: "Member Added", description: `${memberPayload.name} has been added to the project.` });
      setSelectedNewMemberEmail(""); setNewMemberRoleInProject(""); setNewMemberIsProjectHod(false);
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
      toast({ title: "Error", description: "Failed to add member.", variant: "destructive" });
    } finally {
      setIsAddingMember(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemoveInfo || !projectData || !user?.role) { setIsConfirmRemoveMemberDialogOpen(false); return; }
    setIsRemovingMember(true);
    try {
      await removeMemberFromProject(projectData.id, memberToRemoveInfo.email);
      const refreshedProject = await getProjectById(projectData.id);
      setProjectData(refreshedProject || null);
      toast({ title: "Member Removed", description: `${memberToRemoveInfo.name} has been removed from the project.` });
      setMemberToRemoveInfo(null); setIsConfirmRemoveMemberDialogOpen(false); 
    } catch (error) {
      console.error("Error removing member:", error);
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    } finally {
      setIsRemovingMember(false);
    }
  };

  const openRemoveMemberDialog = (member: ProjectMember) => {
    if (!user?.role || !canManageAnyMember) { 
       toast({ title: "Permission Denied", description: "You do not have permission to remove members.", variant: "destructive"}); return;
    }
    setMemberToRemoveInfo({ email: member.email, name: member.name, role: member.role as UserRole | undefined });
    setIsConfirmRemoveMemberDialogOpen(true);
  };

  const calculateOverallProgress = (tasks: Task[]): number => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <section className="project-details-content flex flex-col gap-6" aria-labelledby="project-details-heading">
      <div className="project-page-header flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="icon" asChild className="flex-shrink-0">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 id="project-details-heading" className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">{projectData.name}</h1>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {canEditProject && (
            <Dialog open={isEditProjectDialogOpen} onOpenChange={(isOpen) => {
              setIsEditProjectDialogOpen(isOpen);
              if (isOpen && projectData) { 
                  setEditingProjectForm({
                      name: projectData.name, location: projectData.location, status: projectData.status,
                      startDate: projectData.startDate ? utilFormatDate(new Date(projectData.startDate)) : "",
                      projectedLaunchDate: projectData.projectedLaunchDate ? utilFormatDate(new Date(projectData.projectedLaunchDate)) : "",
                      franchiseType: projectData.franchiseType, threeDRenderUrl: projectData.threeDRenderUrl,
                  });
                  setEditingPropertyDetailsForm(projectData.propertyDetails || {});
                  setEditingTimelineForm(projectData.projectTimeline || {});
                  setEditingMilestones(projectData.milestones ? projectData.milestones.map(m => ({...m})) : []);
                  setEditingBlockers(projectData.blockers ? projectData.blockers.map(b => ({...b})) : []);
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1" disabled={isSavingProject}>
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit Project
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Project: {editingProjectForm.name || projectData.name}</DialogTitle>
                  <DialogDescription>
                    Modify the details of this project. Click save when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                <div className="grid gap-4 py-4">
                  <h3 className="text-md font-semibold mb-1 col-span-full">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editProjectName">Project Name</Label>
                      <Input id="editProjectName" value={editingProjectForm.name || ""} onChange={(e) => handleEditProjectFieldChange('name', e.target.value)} disabled={isSavingProject}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editProjectLocation">Location</Label>
                      <Input id="editProjectLocation" value={editingProjectForm.location || ""} onChange={(e) => handleEditProjectFieldChange('location', e.target.value)} disabled={isSavingProject}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="editProjectStatus">Project Status</Label>
                        <Select
                            value={editingProjectForm.status || ""}
                            onValueChange={(value) => handleEditProjectFieldChange('status', value as StoreProject['status'])}
                            disabled={isSavingProject}
                        >
                            <SelectTrigger id="editProjectStatus"><SelectValue placeholder="Select project status" /></SelectTrigger>
                            <SelectContent>
                                {projectStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="editFranchiseType">Franchise Type</Label>
                        <Select value={editingProjectForm.franchiseType || ""} onValueChange={(value) => handleEditProjectFieldChange('franchiseType', value as StoreType)} disabled={isSavingProject}>
                            <SelectTrigger><SelectValue placeholder="Select franchise type" /></SelectTrigger>
                            <SelectContent>
                                {storeTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="editStartDate">Start Date</Label>
                        <Input id="editStartDate" type="date" value={editingProjectForm.startDate || ""} onChange={(e) => handleEditProjectFieldChange('startDate', e.target.value)} disabled={isSavingProject}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="editProjectedLaunchDate">Projected Launch Date</Label>
                        <Input id="editProjectedLaunchDate" type="date" value={editingProjectForm.projectedLaunchDate || ""} onChange={(e) => handleEditProjectFieldChange('projectedLaunchDate', e.target.value)} disabled={isSavingProject}/>
                    </div>
                  </div>

                  <h3 className="text-md font-semibold mt-4 mb-1 col-span-full">Property Details</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="editPropertyAddress">Address</Label>
                        <Input id="editPropertyAddress" value={editingPropertyDetailsForm?.address || ""} onChange={(e) => handleEditPropertyDetailChange('address', e.target.value)} disabled={isSavingProject}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="editPropertySqft">Sqft</Label>
                        <Input id="editPropertySqft" type="number" value={editingPropertyDetailsForm?.sqft || ""} onChange={(e) => handleEditPropertyDetailChange('sqft', Number(e.target.value))} disabled={isSavingProject}/>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="editPropertyStatus">Property Status</Label>
                        <Select value={editingPropertyDetailsForm?.status || ""} onValueChange={(value) => handleEditPropertyDetailChange('status', value as typeof propertyStatuses[number])} disabled={isSavingProject}>
                            <SelectTrigger><SelectValue placeholder="Select property status" /></SelectTrigger>
                            <SelectContent>
                                {propertyStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="editPropertyNotes">Property Notes</Label>
                        <Textarea id="editPropertyNotes" value={editingPropertyDetailsForm?.notes || ""} onChange={(e) => handleEditPropertyDetailChange('notes' , String(e.target.value))} rows={3} disabled={isSavingProject}/>
                    </div> 
                  </div>

                  <h3 className="text-md font-semibold mt-4 mb-1 col-span-full">Timeline & Visuals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="editTotalDays">Total Project Days</Label>
                        <Input id="editTotalDays" type="number" value={editingTimelineForm?.totalDays || ""} onChange={(e) => handleEditTimelineChange('totalDays', Number(e.target.value))} disabled={isSavingProject}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="editThreeDRenderUrl">3D Render URL</Label>
                        <Input id="editThreeDRenderUrl" value={editingProjectForm.threeDRenderUrl || ""} onChange={(e) => handleEditProjectFieldChange('threeDRenderUrl', e.target.value)} placeholder="https://example.com/render.jpg" disabled={isSavingProject}/>
                    </div>
                  </div>

                  <h3 className="text-md font-semibold mt-6 mb-2 col-span-full border-t pt-4">Milestones</h3>
                  <div className="col-span-full space-y-4 max-h-[250px] overflow-y-auto pr-2">
                    {editingMilestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((milestone, index) => (
                      <div key={milestone.id || index} className="p-3 border rounded-md space-y-3 bg-muted/30 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`milestoneName-${index}`}>Name</Label>
                            <Input id={`milestoneName-${index}`} value={milestone.name} onChange={(e) => handleEditMilestoneFieldChange(index, 'name', e.target.value)} disabled={isSavingProject}/>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`milestoneDate-${index}`}>Date</Label>
                            <Input id={`milestoneDate-${index}`} type="date" value={milestone.date} onChange={(e) => handleEditMilestoneFieldChange(index, 'date', e.target.value)} disabled={isSavingProject}/>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`milestoneDesc-${index}`}>Description</Label>
                          <Textarea id={`milestoneDesc-${index}`} value={milestone.description || ""} onChange={(e) => handleEditMilestoneFieldChange(index, 'description', e.target.value)} rows={2} disabled={isSavingProject}/>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`milestoneCompleted-${index}`} checked={milestone.completed} onCheckedChange={(checked) => handleEditMilestoneFieldChange(index, 'completed', !!checked)} disabled={isSavingProject}/>
                          <Label htmlFor={`milestoneCompleted-${index}`} className="font-normal">Completed</Label>
                        </div>
                        <Button
                          type="button" variant="ghost" size="icon"
                          className="absolute top-1 right-1 h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => setEditingMilestones(prev => prev.filter((_, i) => i !== index))}
                          aria-label="Remove milestone" disabled={isSavingProject}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                     {editingMilestones.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No milestones defined yet.</p>}
                  </div>
                  <div className="col-span-full">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMilestoneDialogOpen(true)} className="mt-2" disabled={isSavingProject}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Milestone
                    </Button>
                  </div>

                   <h3 className="text-md font-semibold mt-6 mb-2 col-span-full border-t pt-4">Blockers</h3>
                    <div className="col-span-full">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBlockerDialogOpen(true)} className="mt-1" disabled={isSavingProject}>
                          <AlertTriangle className="mr-2 h-4 w-4" /> Add Blocker
                        </Button>
                         <p className="text-xs text-muted-foreground mt-1">Newly added blockers will be saved with the project. View and manage existing blockers in the Timeline tab.</p>
                    </div>
                </div>
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isSavingProject}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSaveProjectChanges} disabled={isSavingProject}>
                    {isSavingProject ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isAddTaskDialogOpen} onOpenChange={(isOpen) => {
            setIsAddTaskDialogOpen(isOpen);
            if (!isOpen) {
              setNewTaskName(""); setNewTaskDepartment(""); setNewTaskDescription("");
              setNewTaskDueDate(""); setNewTaskAssignedTo(""); setNewTaskPriority("Medium");
            }
          }}>
           {!isUserMember && (
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1" disabled={isSubmittingTask}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Task
                </span>
              </Button>
            </DialogTrigger>
           )}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new task. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskName" className="sm:text-right">Name</Label>
                  <Input id="taskName" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} className="sm:col-span-3" disabled={isSubmittingTask}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskDepartment" className="sm:text-right">Department</Label>
                  <Select value={newTaskDepartment} onValueChange={(value) => setNewTaskDepartment(value as Department | "")} disabled={isSubmittingTask}>
                    <SelectTrigger className="sm:col-span-3"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{allPossibleDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskAssignedTo" className="sm:text-right">Assign To</Label>
                  <Input id="taskAssignedTo" value={newTaskAssignedTo} onChange={(e) => setNewTaskAssignedTo(e.target.value)} className="sm:col-span-3" placeholder="e.g. Priya Sharma" disabled={isSubmittingTask}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskPriority" className="sm:text-right">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as TaskPriority)} disabled={isSubmittingTask}>
                    <SelectTrigger className="sm:col-span-3"><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>{allPossibleTaskPriorities.map(prio => <SelectItem key={prio} value={prio}>{prio}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-x-4 gap-y-2">
                  <Label htmlFor="taskDescription" className="sm:text-right pt-1">Description</Label>
                  <Textarea id="taskDescription" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} className="sm:col-span-3" placeholder="Optional task description" disabled={isSubmittingTask}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskDueDate" className="sm:text-right">Due Date</Label>
                  <Input id="taskDueDate" type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="sm:col-span-3" disabled={isSubmittingTask}/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isSubmittingTask}>Cancel</Button></DialogClose>
                <Button onClick={handleAddNewTask} disabled={isSubmittingTask}>{isSubmittingTask ? "Adding..." : "Save Task"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDocumentDialogOpen} onOpenChange={(isOpen) => {
            setIsAddDocumentDialogOpen(isOpen);
            if (!isOpen) {
              setNewDocumentFile(null); setNewDocumentName(""); setNewDocumentType("");
              setNewDocumentDataAiHint(""); setNewDocumentHodOnly(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1" disabled={isSubmittingDocument}>
                <UploadCloud className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Document
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogDescription>Upload a file and provide its details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="docFile" className="sm:text-right">File</Label>
                  <Input id="docFile" type="file" onChange={handleFileSelected} className="sm:col-span-3" disabled={isSubmittingDocument}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="docName" className="sm:text-right">Name</Label>
                  <Input id="docName" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} className="sm:col-span-3" disabled={isSubmittingDocument}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="docType" className="sm:text-right">Type</Label>
                  <Select value={newDocumentType} onValueChange={(value) => setNewDocumentType(value as DocumentFile['type'] | "")} disabled={isSubmittingDocument}>
                    <SelectTrigger className="sm:col-span-3"><SelectValue placeholder="Select document type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3D Render">3D Render</SelectItem>
                      <SelectItem value="Property Document">Property Document</SelectItem>
                      <SelectItem value="Marketing Collateral">Marketing Collateral</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newDocumentType === "3D Render" && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                    <Label htmlFor="docAiHint" className="sm:text-right">AI Hint</Label>
                    <Input id="docAiHint" value={newDocumentDataAiHint} onChange={(e) => setNewDocumentDataAiHint(e.target.value)} className="sm:col-span-3" placeholder="e.g., modern storefront" disabled={isSubmittingDocument}/>
                  </div>
                )}
                {(isUserAdmin || isUserSuperAdmin) && ( 
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="docHodOnly" className="sm:text-right">Visibility</Label>
                  <div className="sm:col-span-3 flex items-center space-x-2">
                    <Checkbox id="docHodOnly" checked={newDocumentHodOnly} onCheckedChange={(checked) => setNewDocumentHodOnly(!!checked)} disabled={isSubmittingDocument}/>
                    <Label htmlFor="docHodOnly" className="font-normal text-sm">Share with HOD only</Label>
                  </div>
                </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={isSubmittingDocument}>Cancel</Button></DialogClose>
                <Button onClick={handleAddNewDocument} disabled={!newDocumentFile || isSubmittingDocument}>{isSubmittingDocument ? "Uploading..." : "Save Document"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
         <Badge variant={projectData.status === "Launched" ? "default" : "secondary"} className={cn("flex-shrink-0 self-start sm:self-center", projectData.status === "Launched" ? "bg-accent text-accent-foreground" : "")}>
            {projectData.status}
          </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle id="project-overview-heading">Project Overview</CardTitle>
          <CardDescription>{projectData.location}</CardDescription>
        </CardHeader> 
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Projected Launch Date</p>
            <p className="text-muted-foreground">{projectData.projectedLaunchDate ? format(new Date(projectData.projectedLaunchDate), "PPP") : "N/A"}</p>
          </div> 
          <div>
            <p className="text-sm font-medium">Start Date</p>
            <p className="text-muted-foreground">{projectData.startDate ? format(new Date(projectData.startDate), "PPP") : "N/A"}</p>
          </div>
          {projectData.franchiseType && (
            <div>
              <p className="text-sm font-medium flex items-center">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                Franchise Type
              </p>
              <p className="text-muted-foreground">{projectData.franchiseType}</p>
            </div>
          )}
          <div className={projectData.franchiseType ? "" : "md:col-span-2"}>
            <p className="text-sm font-medium">Overall Progress: {projectData.currentProgress}%</p>
            <Progress value={projectData.currentProgress} className="mt-1" />
          </div>
          {projectData.propertyDetails && (
            <div>
              <p className="text-sm font-medium">Property Status</p>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                {projectData.propertyDetails.status} - {projectData.propertyDetails.sqft} sqft
              </p>
            </div>
          )}
          {projectData.projectTimeline && (
             <div>
                <p className="text-sm font-medium">Project Timeline</p>
                <p className="text-muted-foreground">Day {projectData.projectTimeline.currentDay} of {projectData.projectTimeline.totalDays}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="departments">
        <TabsList className="grid w-full grid-cols-1 h-auto sm:h-10 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          {!isUserMember && <TabsTrigger value="files">Files</TabsTrigger>}
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="comments">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.property && <DepartmentCard title="Property Team" icon={Landmark} tasks={departments.property.tasks || []} notes={departments.property.notes} onClick={() => handleOpenDepartmentDialog('Property Team', 'Property', departments.property?.tasks)} isLockedForCurrentUser={isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'Property')} />}
            {departments.project && <DepartmentCard title="Project Team" icon={Target} tasks={departments.project.tasks || []} notes={departments.project.notes} onClick={() => handleOpenDepartmentDialog('Project Team', 'Project', departments.project?.tasks)} isLockedForCurrentUser={isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'Project')}>
                {!(isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'Project')) && projectData.threeDRenderUrl && (
                  <div className="my-2">
                    <p className="text-xs font-medium mb-1">3D Store Visual:</p>
                    <a href={projectData.threeDRenderUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                        <Image src={projectData.threeDRenderUrl} alt="3D Store Render" width={300} height={200} className="rounded-md object-cover w-full aspect-video" data-ai-hint="store render"/>
                    </a>
                  </div>
                )}
              </DepartmentCard>}
            {departments.merchandising && <DepartmentCard title="Merchandising Team" icon={Paintbrush} tasks={departments.merchandising.tasks || []} notes={departments.merchandising.virtualPlanUrl ? `Virtual Plan: ${departments.merchandising.virtualPlanUrl}` : undefined} onClick={() => handleOpenDepartmentDialog('Merchandising Team', 'Merchandising', departments.merchandising?.tasks)} isLockedForCurrentUser={isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'Merchandising')} />}
            {departments.hr && <DepartmentCard title="HR Team" icon={UsersIcon} tasks={departments.hr.tasks || []} notes={departments.hr.recruitmentStatus} onClick={() => handleOpenDepartmentDialog('HR Team', 'HR', departments.hr?.tasks)} isLockedForCurrentUser={isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'HR')}>
                {!(isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'HR')) && departments.hr.totalNeeded && (
                  <p className="text-xs text-muted-foreground">Staff: {departments.hr.staffHired || 0} / {departments.hr.totalNeeded} hired</p>
                )}
              </DepartmentCard>}
            {departments.marketing && <DepartmentCard title="Marketing Team" icon={Volume2} tasks={departments.marketing.tasks || []} onClick={() => handleOpenDepartmentDialog('Marketing Team', 'Marketing', departments.marketing?.tasks)} isLockedForCurrentUser={isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'Marketing')}>
                {!(isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'Marketing')) && departments.marketing.preLaunchCampaigns && departments.marketing.preLaunchCampaigns.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Pre-Launch Campaigns:</p>
                    <ul className="space-y-0.5 text-xs">
                      {departments.marketing.preLaunchCampaigns.slice(0, 2).map(c => <li key={c.id}>{c.name} ({c.status})</li>)}
                      {departments.marketing.preLaunchCampaigns.length > 2 && <li>+{departments.marketing.preLaunchCampaigns.length - 2} more</li>}
                    </ul>
                  </div>
                )}
              </DepartmentCard>}
            {departments.it && <DepartmentCard title="IT Team" icon={MilestoneIcon} tasks={departments.it.tasks || []} notes={departments.it.notes} onClick={() => handleOpenDepartmentDialog('IT Team', 'IT', departments.it?.tasks)} isLockedForCurrentUser={isUserMember && (!currentUserProjectMembership || currentUserProjectMembership.department !== 'IT')} />}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle id="project-members-heading">Project Members ({projectData.members?.length || 0})</CardTitle>
                <CardDescription>Team members assigned to this project.</CardDescription>
              </div>
              {canEditProject && (
                 <Dialog open={isAddMemberDialogOpen} onOpenChange={(isOpen) => {
                    setIsAddMemberDialogOpen(isOpen);
                    if (!isOpen) { setSelectedNewMemberEmail(""); setNewMemberRoleInProject(""); setNewMemberIsProjectHod(false); }
                 }}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={isAddingMember}><UserPlus className="mr-2 h-4 w-4" /> Add Member</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Add Project Member</DialogTitle><DialogDescription>Select a person and assign their role.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="select-member">Select Person</Label>
                        <Select value={selectedNewMemberEmail} onValueChange={setSelectedNewMemberEmail} disabled={isAddingMember}>
                          <SelectTrigger id="select-member"><SelectValue placeholder="Choose a person" /></SelectTrigger>
                          <SelectContent>
                            {availableMembersToAdd.length > 0 ? (
                              availableMembersToAdd.map(person => (<SelectItem key={person.email} value={person.email}>{person.name} ({person.department})</SelectItem>))
                            ) : (<div className="p-2 text-sm text-muted-foreground text-center">No unassigned contacts.</div>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label htmlFor="member-role">Role in Project</Label><Input id="member-role" value={newMemberRoleInProject} onChange={(e) => setNewMemberRoleInProject(e.target.value)} placeholder="e.g., Lead Developer" disabled={isAddingMember}/></div>
                      <div className="flex items-center space-x-2"><Checkbox id="member-is-hod" checked={newMemberIsProjectHod} onCheckedChange={(checked) => setNewMemberIsProjectHod(!!checked)} disabled={isAddingMember}/><Label htmlFor="member-is-hod" className="text-sm font-normal text-muted-foreground">Assign HOD rights</Label></div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button variant="outline" disabled={isAddingMember}>Cancel</Button></DialogClose><Button onClick={handleAddProjectMember} disabled={!selectedNewMemberEmail || isAddingMember}>{isAddingMember ? "Adding..." : "Add Member"}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {(projectData.members && projectData.members.length > 0) ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projectData.members.map(member => (
                    <Card key={member.email} className="flex flex-col">
                      <CardHeader className="flex flex-row items-start gap-3 p-4">
                        <Avatar className="h-12 w-12"><AvatarImage src={`https://picsum.photos/seed/${member.avatarSeed || member.email}/80/80`} alt={member.name} data-ai-hint="person portrait"/><AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{member.name}</CardTitle><CardDescription className="text-xs">{member.email}</CardDescription>
                          {member.isProjectHod && (<Badge variant="secondary" className="mt-1 text-xs bg-amber-100 text-amber-700 border-amber-300"><Crown className="mr-1 h-3 w-3" /> Project HOD</Badge>)}
                        </div>
                        {canManageAnyMember && (<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => openRemoveMemberDialog(member)} aria-label={`Remove ${member.name}`} disabled={isRemovingMember}><UserX className="h-4 w-4" /></Button>)}
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-grow">{member.roleInProject && <p className="text-sm font-medium text-primary">{member.roleInProject}</p>}{member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}</CardContent>
                    </Card>
                  ))}
                </div>
              ) : (<p className="text-muted-foreground text-center py-4">No members assigned yet.</p>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3">
              <div>
                <CardTitle id="all-tasks-heading">{isUserMember && currentUserProjectMembership?.department ? `${currentUserProjectMembership.department} Tasks` : "All Tasks"} ({filteredTasksForTable.length})</CardTitle>
                <CardDescription>{isUserMember && currentUserProjectMembership?.department ? `Tasks for the ${currentUserProjectMembership.department} department.` : "Comprehensive list of tasks."} Click task to view/edit.</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label htmlFor="taskPriorityFilter" className="text-sm text-muted-foreground whitespace-nowrap">Filter by Priority:</Label>
                  <Select value={taskFilterPriority} onValueChange={(value) => setTaskFilterPriority(value as TaskPriority | "All")}>
                      <SelectTrigger id="taskPriorityFilter" className="h-9 w-full sm:w-[150px]"><SelectValue placeholder="Select Priority" /></SelectTrigger>
                      <SelectContent>{allPossibleTaskPriorities.map((prio) => (<SelectItem key={prio} value={prio}>{prio}</SelectItem>))}<SelectItem value="All">All Priorities</SelectItem></SelectContent>
                  </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTasksForTable.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Task Name</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead className="hidden md:table-cell">Due Date</TableHead><TableHead className="text-right">Assignee</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredTasksForTable.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell><Button variant="link" className="p-0 h-auto font-medium text-left whitespace-normal text-base" onClick={() => handleViewTaskDetails(task)}>{task.name}</Button></TableCell>
                        <TableCell>{task.department}</TableCell>
                        <TableCell><Badge variant={task.status === "Completed" ? "outline" : "secondary"}>{task.status}</Badge></TableCell>
                        <TableCell><Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"}>{task.priority || "N/A"}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{task.dueDate ? format(new Date(task.dueDate), "PPP") : "N/A"}</TableCell>
                        <TableCell className="text-right">{task.assignedTo || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (<p className="text-muted-foreground text-center py-4">{isUserMember && !currentUserProjectMembership?.department ? "Not assigned to a department." : "No tasks match filter."}</p>)}
            </CardContent>
          </Card>
        </TabsContent>

        {!isUserMember && (
        <TabsContent value="files" className="mt-4">
          <Card>
            <CardHeader><CardTitle id="project-files-heading">Files ({visibleFiles.length})</CardTitle><CardDescription>All project-related files. Click a card to view.</CardDescription></CardHeader>
            <CardContent>
              {visibleFiles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleFiles.map((doc) => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="block hover:shadow-lg transition-shadow rounded-lg">
                      <Card className="overflow-hidden h-full flex flex-col">
                        {(doc.type === "3D Render" && (doc.url.startsWith("blob:") || doc.url.startsWith("https")) ) ? (<div className="relative w-full h-32"><Image src={doc.url} alt={doc.name} layout="fill" objectFit="cover" data-ai-hint={doc.dataAiHint || "office document"}/></div>) : (<div className="h-32 bg-muted flex items-center justify-center"><FileText className="w-12 h-12 text-muted-foreground" /></div>)}
                        <CardContent className="p-3 flex-grow"><p className="font-medium text-sm truncate flex items-center" title={doc.name}>{doc.name}{doc.hodOnly && <ShieldCheck className="ml-2 h-4 w-4 text-primary shrink-0" title="HOD Only" />}</p><p className="text-xs text-muted-foreground">{doc.type} - {doc.size}</p><p className="text-xs text-muted-foreground">Uploaded: {doc.uploadedAt ? format(new Date(doc.uploadedAt), "PPP") : "N/A"} by {doc.uploadedBy || "System"}</p></CardContent>
                         <CardFooter className="p-3 border-t flex items-center justify-between"><span className="text-xs text-muted-foreground">Click to view</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></CardFooter>
                      </Card>
                    </a>
                  ))}
                </div>
              ) : (<p className="text-muted-foreground text-center py-4">No files viewable by you for this project yet.</p>)}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader><CardTitle id="project-timeline-heading">Project Milestones &amp; Timeline</CardTitle><CardDescription>Key dates and progress over the {projectData.projectTimeline?.totalDays}-day plan.</CardDescription></CardHeader>
            <CardContent>
              <div className="relative pl-6">
                <div className="absolute left-[calc(0.75rem-1px)] top-2 bottom-2 w-0.5 bg-border"></div>
                {(projectData.milestones || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((milestone) => (
                  <div key={milestone.id} className="relative mb-6">
                    <div className={cn("absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full", milestone.completed ? "bg-accent" : "bg-muted border-2 border-accent")}>{milestone.completed ? (<CheckCircle className="h-4 w-4 text-accent-foreground" />) : (<MilestoneIcon className="h-3 w-3 text-accent" />)}</div>
                    <div className="ml-6"><h4 className="font-semibold">{milestone.name}</h4><p className="text-sm text-muted-foreground"><CalendarDays className="inline h-3.5 w-3.5 mr-1" />{format(new Date(milestone.date), "PPP")}</p>{milestone.description && <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>}</div>
                  </div>
                ))}
                {projectData.status !== "Launched" && projectData.status !== "Planning" && projectData.projectTimeline && (<div className="relative mt-8 mb-6"><div className="absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-primary-foreground shadow"><Clock className="h-3.5 w-3.5 text-primary-foreground" /></div><div className="ml-6"><h4 className="font-semibold text-primary">Current Day: {projectData.projectTimeline.currentDay}</h4><p className="text-sm text-muted-foreground">Project is ongoing.</p></div></div>)}
                <div className="relative mt-8"><div className={cn("absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full", projectData.status === "Launched" ? "bg-accent" : "bg-muted border-2 border-primary")}>{projectData.status === "Launched" ? <CheckCircle className="h-4 w-4 text-accent-foreground" /> : <Target className="h-3.5 w-3.5 text-primary" />}</div><div className="ml-6"><h4 className="font-semibold">{projectData.status === "Launched" ? "Launched!" : "Projected Launch"}</h4><p className="text-sm text-muted-foreground"><CalendarDays className="inline h-3.5 w-3.5 mr-1" />{projectData.projectedLaunchDate ? format(new Date(projectData.projectedLaunchDate), "PPP") : "N/A"}</p></div></div>
              </div>
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2"><h3 className="text-lg font-semibold">Project Blockers</h3><Button variant="outline" size="sm" onClick={() => setShowBlockersInTimeline(!showBlockersInTimeline)}>{showBlockersInTimeline ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}{showBlockersInTimeline ? "Hide Blockers" : "Show Blockers"} ({(projectData.blockers || []).length})</Button></div>
                {showBlockersInTimeline && (((projectData.blockers || []).length > 0) ? (<div className="space-y-4">
                      {(projectData.blockers || []).sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()).map((blocker) => (
                        <Card key={blocker.id} className="bg-muted/50">
                          <CardHeader className="p-4 pb-2"><div className="flex justify-between items-start"><CardTitle className="text-md">{blocker.title}</CardTitle><Badge variant={blocker.isResolved ? "default" : "destructive"} className={cn(blocker.isResolved && "bg-accent text-accent-foreground")}>{blocker.isResolved ? "Resolved" : "Active"}</Badge></div><CardDescription className="text-xs">Reported by {blocker.reportedBy || "N/A"} on {format(new Date(blocker.dateReported), "PPP")}</CardDescription></CardHeader>
                          <CardContent className="p-4 pt-0 text-sm"><p className="whitespace-pre-wrap">{blocker.description}</p>{blocker.isResolved && blocker.dateResolved && (<p className="text-xs text-muted-foreground mt-2">Resolved On: {format(new Date(blocker.dateResolved), "PPP")}</p>)}</CardContent>
                          {canEditProject && (<CardFooter className="p-4 pt-0 flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleRemoveTimelineBlocker(blocker.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Remove blocker"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove</Button><Button variant="outline" size="sm" onClick={() => handleToggleTimelineBlockerResolution(blocker.id)}>{blocker.isResolved ? "Mark as Unresolved" : "Mark as Resolved"}</Button></CardFooter>)}
                        </Card>
                      ))}</div>) : (<p className="text-sm text-muted-foreground text-center py-4">No blockers reported.</p>))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardHeader><CardTitle id="project-comments-heading">Project Discussion ({projectComments.length})</CardTitle><CardDescription>Share updates, ask questions, and collaborate.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10 mt-1 flex-shrink-0"><AvatarImage src={`https://picsum.photos/seed/${user?.id || 'currentUser'}/40/40`} alt={user?.name || "Current User"} data-ai-hint="user avatar"/><AvatarFallback>{(user?.name || user?.email || "CU").substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="flex-1"><Textarea placeholder="Write a comment..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="mb-2" rows={3} disabled={isSubmittingComment}/><div className="flex justify-end"><Button onClick={handleAddComment} disabled={!newCommentText.trim() || isSubmittingComment}>{isSubmittingComment ? "Posting..." : "Post Comment"}</Button></div></div>
              </div>
              {commentsLoading && <p className="text-sm text-muted-foreground text-center py-8">Loading comments...</p>}
              {projectComments.length > 0 ? (<div className="space-y-0">{projectComments.map((comment, index) => (<CommentCard key={comment.id || comment._id || index} comment={comment} onReply={handleReplyToComment} />))}</div>) : (!commentsLoading && <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isViewTaskDialogOpen} onOpenChange={(isOpen) => {
        setIsViewTaskDialogOpen(isOpen);
        if (!isOpen) { setSelectedTask(null); /* Reset other states */ }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{selectedTask?.name || "Task Details"}</DialogTitle><DialogDescription>View or update task details and manage comments.</DialogDescription></DialogHeader>
          {selectedTask && (<ScrollArea className="max-h-[70vh] pr-6">
              <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskDepartmentEdit" className="sm:text-right text-muted-foreground">Department:</Label>
                  <Select value={editingSelectedTaskDepartment} onValueChange={(value) => setEditingSelectedTaskDepartment(value as Department | "")} disabled={isUserMember || isUpdatingTask}><SelectTrigger id="taskDepartmentEdit" className="sm:col-span-2"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{allPossibleDepartments.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent></Select>
                </div> 
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskPriorityEdit" className="sm:text-right text-muted-foreground">Priority:</Label>
                  <Select value={editingSelectedTaskPriority} onValueChange={(value) => setEditingSelectedTaskPriority(value as TaskPriority | "")} disabled={isUserMember || isUpdatingTask}><SelectTrigger id="taskPriorityEdit" className="sm:col-span-2"><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent>{allPossibleTaskPriorities.map(prio => (<SelectItem key={prio} value={prio}>{prio}</SelectItem>))}<SelectItem value="None">None</SelectItem></SelectContent></Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskStatusEdit" className="sm:text-right text-muted-foreground">Status:</Label>
                  <Select value={editingTaskStatus} onValueChange={(value) => setEditingTaskStatus(value as Task['status'] | "")} disabled={isUpdatingTask}><SelectTrigger id="taskStatusEdit" className="sm:col-span-2"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Blocked">Blocked</SelectItem></SelectContent></Select>
                </div>
                {selectedTask.description && (<div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-x-4 gap-y-2"><Label className="sm:text-right text-muted-foreground pt-1">Description:</Label><div className="sm:col-span-2 whitespace-pre-wrap">{selectedTask.description}</div></div>)}
                {selectedTask.dueDate && (<div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-x-4 gap-y-2"><Label className="sm:text-right text-muted-foreground">Due Date:</Label><div className="sm:col-span-2">{format(new Date(selectedTask.dueDate), "PPP")}</div></div>)}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-x-4 gap-y-2">
                  <Label htmlFor="taskAssignedToEdit" className="sm:text-right text-muted-foreground">Assigned To:</Label>
                  <Input id="taskAssignedToEdit" value={editingTaskAssignedTo} onChange={(e) => setEditingTaskAssignedTo(e.target.value)} className="sm:col-span-2" placeholder="Assignee name" disabled={(isUserMember && !( (selectedTask.assignedTo === user?.email || selectedTask.assignedTo === user?.name) || (!selectedTask.assignedTo && currentUserProjectMembership?.department === selectedTask.department) )) || isUpdatingTask}/>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-md font-semibold mb-3">Task Comments ({taskComments.length})</h3>
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-9 w-9 mt-1 flex-shrink-0"><AvatarImage src={`https://picsum.photos/seed/${user?.id || 'currentUserTaskComment'}/40/40`} alt={user?.name || "Current User"} data-ai-hint="user avatar"/><AvatarFallback>{(user?.name || user?.email || "CU").substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1"><Textarea placeholder="Write a comment for this task..." value={newTaskCommentTextForTask} onChange={(e) => setNewTaskCommentTextForTask(e.target.value)} className="mb-2" rows={2} disabled={isSubmittingTaskComment}/><div className="flex justify-end"><Button onClick={handlePostNewTaskComment} disabled={!newTaskCommentTextForTask.trim() || isSubmittingTaskComment} size="sm"><MessageSquare className="mr-2 h-4 w-4" />{isSubmittingTaskComment ? "Posting..." : "Post Comment"}</Button></div></div>
                </div>
                {taskCommentsLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>}
                {taskComments.length > 0 ? (<div className="space-y-0">{taskComments.map((comment, index) => (<CommentCard key={comment.id || comment._id || index} comment={comment} onReply={(commentId, replyText) => handleReplyToTaskComment(selectedTask.id, commentId, replyText)}/>))}</div>) : (!taskCommentsLoading && <p className="text-sm text-muted-foreground text-center py-4">No comments for this task yet.</p>)}
              </div>
            </ScrollArea>)}
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline" disabled={isUpdatingTask}>Cancel</Button></DialogClose>
            <Button onClick={handleUpdateTaskDetails} disabled={!selectedTask || isUpdatingTask || (editingTaskStatus === selectedTask?.status && editingTaskAssignedTo === (selectedTask?.assignedTo || "") && editingSelectedTaskDepartment === selectedTask?.department && editingSelectedTaskPriority === (selectedTask?.priority || "Medium"))}>{isUpdatingTask ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepartmentTasksDialogOpen} onOpenChange={setIsDepartmentTasksDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{departmentDialogTitle}</DialogTitle><DialogDescription>List of tasks for this department. Click task to view/edit.</DialogDescription></DialogHeader>
          <div className="py-4">
            {departmentDialogTasks.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Task Name</TableHead><TableHead>Status</TableHead><TableHead className="hidden sm:table-cell">Assignee</TableHead><TableHead className="hidden md:table-cell">Due Date</TableHead></TableRow></TableHeader>
                <TableBody> 
                  {departmentDialogTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell><Button variant="link" className="p-0 h-auto font-medium text-left whitespace-normal" onClick={() => { setIsDepartmentTasksDialogOpen(false); handleViewTaskDetails(task); }}>{task.name}</Button>{task.description && (<div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>)}</TableCell>
                      <TableCell><Badge variant={task.status === "Completed" ? "outline" : "secondary"}>{task.status}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell">{task.assignedTo || "N/A"}</TableCell>
                      <TableCell className="hidden md:table-cell">{task.dueDate ? format(new Date(task.dueDate), "PPP") : "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (<p className="text-muted-foreground text-center">No tasks for this department.</p>)}
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
       
      {canEditProject && (<Dialog open={isAddMilestoneDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setNewMilestoneName(""); setNewMilestoneDate(utilFormatDate(new Date())); setNewMilestoneDescription(""); } setIsAddMilestoneDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Milestone</DialogTitle><DialogDescription>Enter details for the new milestone.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="newMilestoneName">Name</Label><Input id="newMilestoneName" value={newMilestoneName} onChange={(e) => setNewMilestoneName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="newMilestoneDate">Date</Label><Input id="newMilestoneDate" type="date" value={newMilestoneDate} onChange={(e) => setNewMilestoneDate(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="newMilestoneDescription">Description (Optional)</Label><Textarea id="newMilestoneDescription" value={newMilestoneDescription} onChange={(e) => setNewMilestoneDescription(e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleSaveNewMilestone}>Save Milestone</Button></DialogFooter>
        </DialogContent>
      </Dialog>)}

      {canEditProject && (<Dialog open={isAddBlockerDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setNewBlockerTitle(""); setNewBlockerDescription("");} setIsAddBlockerDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Blocker</DialogTitle><DialogDescription>Describe the issue blocking progress.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="newBlockerTitle">Title</Label><Input id="newBlockerTitle" value={newBlockerTitle} onChange={(e) => setNewBlockerTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="newBlockerDescription">Description</Label><Textarea id="newBlockerDescription" value={newBlockerDescription} onChange={(e) => setNewBlockerDescription(e.target.value)} rows={4} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleSaveNewBlocker}>Save Blocker</Button></DialogFooter>
        </DialogContent>
      </Dialog>)}
      
      <AlertDialog open={isConfirmRemoveMemberDialogOpen} onOpenChange={setIsConfirmRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirm Member Removal</AlertDialogTitle><AlertDialogDescription>Remove {memberToRemoveInfo?.name || 'this member'} (Role: {memberToRemoveInfo?.role || 'N/A'})? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setMemberToRemoveInfo(null)} disabled={isRemovingMember}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmRemoveMember} className={buttonVariants({ variant: "destructive" })} disabled={isRemovingMember}>{isRemovingMember ? "Removing..." : "Confirm Removal"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
