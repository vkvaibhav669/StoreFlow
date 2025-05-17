
"use client"; 

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectById, mockProjects } from "@/lib/data"; 
import type { Task, DocumentFile, Comment, StoreProject, Department, DepartmentDetails, TaskPriority, User } from "@/types";
import { ArrowLeft, CalendarDays, CheckCircle, Download, FileText, Landmark, Milestone as MilestoneIcon, Paintbrush, Paperclip, PlusCircle, Target, Users, Volume2, Clock, UploadCloud, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Package2 } from "lucide-react";


interface DepartmentCardProps {
  title: string;
  icon: React.ElementType;
  tasks: Task[]; 
  notes?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function DepartmentCard({ title, icon: Icon, tasks, notes, children, onClick }: DepartmentCardProps) {
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeTasksToList = tasks.filter(task => task.status === 'Pending' || task.status === 'In Progress');

  return (
    <Card onClick={onClick} className={cn(onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : "")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {totalTasks > 0 && (
          <CardDescription>{completedTasks} of {totalTasks} tasks completed.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {totalTasks > 0 && <Progress value={progress} className="h-2" />}
        {notes && <p className="text-sm text-muted-foreground italic">{notes}</p>}
        {children}
        {activeTasksToList.length > 0 && (
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
        {activeTasksToList.length === 0 && tasks.length > 0 && !children && <p className="text-sm text-muted-foreground">No active (Pending/In Progress) tasks for this department.</p>}
        {tasks.length === 0 && !children && <p className="text-sm text-muted-foreground">No tasks for this department yet.</p>}
      </CardContent>
    </Card>
  );
}

const allPossibleDepartments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];


export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); 
  const router = useRouter();

  const [projectData, setProjectData] = React.useState<StoreProject | null>(null);
  const [projectComments, setProjectComments] = React.useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = React.useState("");

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const [newTaskName, setNewTaskName] = React.useState("");
  const [newTaskDepartment, setNewTaskDepartment] = React.useState<Department | "">("");
  const [newTaskDescription, setNewTaskDescription] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState<TaskPriority>("Medium");


  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = React.useState(false);
  const [newDocumentFile, setNewDocumentFile] = React.useState<File | null>(null);
  const [newDocumentName, setNewDocumentName] = React.useState("");
  const [newDocumentType, setNewDocumentType] = React.useState<DocumentFile['type'] | "">("");
  const [newDocumentDataAiHint, setNewDocumentDataAiHint] = React.useState("");

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isViewTaskDialogOpen, setIsViewTaskDialogOpen] = React.useState(false);
  const [editingTaskStatus, setEditingTaskStatus] = React.useState<Task['status'] | "">("");
  const [editingTaskAssignedTo, setEditingTaskAssignedTo] = React.useState<string>("");
  const [editingSelectedTaskDepartment, setEditingSelectedTaskDepartment] = React.useState<Department | "">("");
  const [editingSelectedTaskPriority, setEditingSelectedTaskPriority] = React.useState<TaskPriority | "">("");
  const [newTaskCommentText, setNewTaskCommentText] = React.useState("");


  const [isDepartmentTasksDialogOpen, setIsDepartmentTasksDialogOpen] = React.useState(false);
  const [departmentDialogTitle, setDepartmentDialogTitle] = React.useState("");
  const [departmentDialogTasks, setDepartmentDialogTasks] = React.useState<Task[]>([]);

  const currentUserRole = React.useMemo(() => {
    if (!user) return 'user'; 
    return user.role;
  }, [user]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (user) { 
      const currentProject = getProjectById(params.id);
      if (currentProject) {
        setProjectData(currentProject);
        setProjectComments(currentProject.comments || []);
      } else {
        notFound();
      }
    }
  }, [params.id, user]); 


  if (authLoading || !user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading project details..." : "Please sign in."}</p>
      </div>
    );
  }
  
  if (!projectData) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-muted-foreground">Loading project data...</p>
      </div>
    );
  }
  
  const calculateOverallProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleProjectStatusChange = (newStatus: StoreProject['status']) => {
    if (!projectData) return;

    setProjectData(prev => {
      if (!prev) return null;
      const updatedProject = { ...prev, status: newStatus };
      
      const projectIndex = mockProjects.findIndex(p => p.id === updatedProject.id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = { ...updatedProject };
      }
      toast({ title: "Project Status Updated", description: `Project status changed to "${newStatus}".` });
      return updatedProject;
    });
  };

  const handleAddNewTask = () => {
    if (!newTaskName || !newTaskDepartment || !newTaskAssignedTo) {
      toast({ title: "Error", description: "Task Name, Department, and Assignee are required.", variant: "destructive" });
      return;
    }

    const newTaskToAdd: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newTaskName,
      department: newTaskDepartment as Department,
      description: newTaskDescription || undefined,
      dueDate: newTaskDueDate || undefined,
      priority: newTaskPriority,
      status: "Pending",
      assignedTo: newTaskAssignedTo,
      comments: [],
    };
    
    setProjectData(prevProjectData => {
      if (!prevProjectData) return null;

      const updatedRootTasks = [...prevProjectData.tasks, newTaskToAdd];
      
      let newDepartmentsState = JSON.parse(JSON.stringify(prevProjectData.departments || {})) as StoreProject['departments'];
      
      const targetDeptKey = newTaskToAdd.department.toLowerCase() as keyof StoreProject['departments'];
      if (!newDepartmentsState[targetDeptKey]) {
        if (newTaskToAdd.department === "Marketing") {
          newDepartmentsState[targetDeptKey] = { tasks: [], preLaunchCampaigns: [], postLaunchCampaigns: [] };
        } else {
          newDepartmentsState[targetDeptKey] = { tasks: [] };
        }
      }

      allPossibleDepartments.forEach(deptEnumKey => {
        const currentDeptKeyString = deptEnumKey.toLowerCase() as keyof StoreProject['departments'];
        if (newDepartmentsState[currentDeptKeyString]) { 
             (newDepartmentsState[currentDeptKeyString] as DepartmentDetails).tasks = updatedRootTasks.filter(task => task.department === deptEnumKey);
        }
      });
      
      const newOverallProgress = calculateOverallProgress(updatedRootTasks);

      const finalUpdatedProjectData: StoreProject = {
        ...prevProjectData,
        tasks: updatedRootTasks,
        currentProgress: newOverallProgress,
        departments: newDepartmentsState,
      };

      const projectIndex = mockProjects.findIndex(p => p.id === finalUpdatedProjectData.id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = { ...finalUpdatedProjectData }; 
      }
      
      toast({ title: "Task Added", description: `Task "${newTaskToAdd.name}" has been added.` });
      return finalUpdatedProjectData;
    });

    setNewTaskName("");
    setNewTaskDepartment("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskAssignedTo("");
    setNewTaskPriority("Medium");
    setIsAddTaskDialogOpen(false);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocumentFile(file);
      setNewDocumentName(file.name);
    }
  };

  const handleAddNewDocument = () => {
    if (!newDocumentFile || !newDocumentName || !newDocumentType) {
      toast({ title: "Error", description: "File, Document Name, and Document Type are required.", variant: "destructive" });
      return;
    }

    const newDocument: DocumentFile = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newDocumentName,
      type: newDocumentType as DocumentFile['type'], 
      url: newDocumentType === "3D Render" && newDocumentFile.type.startsWith('image/') ? URL.createObjectURL(newDocumentFile) : `https://placehold.co/300x150.png`, 
      size: `${(newDocumentFile.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: user?.name || user?.email || "System",
      dataAiHint: newDocumentType === "3D Render" ? (newDocumentDataAiHint || "abstract design") : undefined,
    };

    setProjectData(prevProjectData => {
      if (!prevProjectData) return null;
      const updatedProject = {
        ...prevProjectData,
        documents: [newDocument, ...prevProjectData.documents],
      };
      const projectIndex = mockProjects.findIndex(p => p.id === updatedProject.id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = updatedProject;
      }
      toast({ title: "Document Added", description: `Document "${newDocument.name}" has been uploaded.` });
      return updatedProject;
    });

    setNewDocumentFile(null);
    setNewDocumentName("");
    setNewDocumentType("");
    setNewDocumentDataAiHint("");
    setIsAddDocumentDialogOpen(false);
  };


  const handleAddComment = () => {
    if (newCommentText.trim()) {
      const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        author: user?.name || user?.email || "Anonymous User", 
        avatarUrl: `https://picsum.photos/seed/${user?.id || 'currentUser'}/40/40`, 
        timestamp: new Date().toISOString(),
        text: newCommentText,
        replies: [],
      };
      const updatedComments = [newComment, ...projectComments];
      setProjectComments(updatedComments);
      
      setProjectData(prev => {
        if (!prev) return null;
        const updatedProject = {...prev, comments: updatedComments};
        const projectIndex = mockProjects.findIndex(p => p.id === updatedProject.id);
        if (projectIndex !== -1) {
            mockProjects[projectIndex] = updatedProject;
        }
        return updatedProject;
      });
      toast({ title: "Comment Posted", description: "Your comment has been added." });
      setNewCommentText("");
    }
  };

  const handleReplyToComment = (commentId: string, replyText: string) => {
    const addReplyRecursively = (currentComments: Comment[]): Comment[] => {
      return currentComments.map(comment => {
        if (comment.id === commentId) {
          const newReply: Comment = {
            id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            author: user?.name || user?.email || "Anonymous User", 
            avatarUrl: `https://picsum.photos/seed/${user?.id || 'replyUser'}/40/40`,
            timestamp: new Date().toISOString(),
            text: replyText,
            replies: [],
          };
          return {
            ...comment,
            replies: [newReply, ...(comment.replies || [])], 
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: addReplyRecursively(comment.replies) };
        }
        return comment;
      });
    };
    const updatedComments = addReplyRecursively(projectComments);
    setProjectComments(updatedComments);
    setProjectData(prev => {
        if (!prev) return null;
        const updatedProject = {...prev, comments: updatedComments};
        const projectIndex = mockProjects.findIndex(p => p.id === updatedProject.id);
        if (projectIndex !== -1) {
            mockProjects[projectIndex] = updatedProject;
        }
        return updatedProject;
    });
    toast({ title: "Reply Posted", description: "Your reply has been added." });
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setEditingTaskStatus(task.status); 
    setEditingTaskAssignedTo(task.assignedTo || "");
    setEditingSelectedTaskDepartment(task.department);
    setEditingSelectedTaskPriority(task.priority || "Medium");
    setNewTaskCommentText(""); 
    setIsViewTaskDialogOpen(true);
  };

  const handleUpdateTaskDetails = () => {
    if (!selectedTask || !projectData) return;

    const newStatus = editingTaskStatus as Task['status'] || selectedTask.status;
    const newAssignedTo = editingTaskAssignedTo || selectedTask.assignedTo;
    const newDepartment = editingSelectedTaskDepartment as Department || selectedTask.department;
    const newPriority = editingSelectedTaskPriority as TaskPriority || selectedTask.priority;
    
    const hasChanges = newStatus !== selectedTask.status ||
                       newAssignedTo !== (selectedTask.assignedTo || "") ||
                       newDepartment !== selectedTask.department ||
                       newPriority !== (selectedTask.priority || "Medium");

    if (!hasChanges) {
        toast({ title: "No Changes", description: "No details were modified for this task.", variant: "default" });
        setIsViewTaskDialogOpen(false);
        return;
    }

    const updatedTask: Task = { 
        ...selectedTask, 
        status: newStatus, 
        assignedTo: newAssignedTo,
        department: newDepartment,
        priority: newPriority
    };

    setProjectData(prevProjectData => {
      if (!prevProjectData) return null;

      const updatedRootTasks = prevProjectData.tasks.map(task =>
        task.id === selectedTask.id ? updatedTask : task
      );

      let newDepartmentsState = JSON.parse(JSON.stringify(prevProjectData.departments || {})) as StoreProject['departments'];
      
      const oldDeptKey = selectedTask.department.toLowerCase() as keyof StoreProject['departments'];
      const newDeptKey = newDepartment.toLowerCase() as keyof StoreProject['departments'];

      if (newDepartment !== selectedTask.department && newDepartmentsState[oldDeptKey]) {
        (newDepartmentsState[oldDeptKey] as DepartmentDetails).tasks = 
          ((newDepartmentsState[oldDeptKey] as DepartmentDetails).tasks || []).filter(dTask => dTask.id !== selectedTask.id);
      }
      
      if (!newDepartmentsState[newDeptKey]) {
         if (newDepartment === "Marketing") {
           newDepartmentsState[newDeptKey] = { tasks: [], preLaunchCampaigns: [], postLaunchCampaigns: [] };
         } else {
           newDepartmentsState[newDeptKey] = { tasks: [] };
         }
      }
      (newDepartmentsState[newDeptKey] as DepartmentDetails).tasks = updatedRootTasks.filter(task => task.department === newDepartment);


      allPossibleDepartments.forEach(deptEnumKey => {
        const currentDeptKeyString = deptEnumKey.toLowerCase() as keyof StoreProject['departments'];
        if (newDepartmentsState[currentDeptKeyString]) { 
             (newDepartmentsState[currentDeptKeyString] as DepartmentDetails).tasks = updatedRootTasks.filter(task => task.department === deptEnumKey);
        }
      });


      const newOverallProgress = calculateOverallProgress(updatedRootTasks);

      const finalUpdatedProjectData: StoreProject = {
        ...prevProjectData,
        tasks: updatedRootTasks,
        currentProgress: newOverallProgress,
        departments: newDepartmentsState,
      };

      const projectIndex = mockProjects.findIndex(p => p.id === finalUpdatedProjectData.id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = { ...finalUpdatedProjectData };
      }
      
      toast({ title: "Task Details Updated", description: `Details for "${selectedTask.name}" have been updated.` });
      setSelectedTask(updatedTask); 
      return finalUpdatedProjectData;
    });

    setIsViewTaskDialogOpen(false);
  };

  const handlePostNewTaskComment = () => {
    if (!selectedTask || !newTaskCommentText.trim() || !projectData) return;

    const newComment: Comment = {
      id: `task-comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      author: user?.name || user?.email || "Anonymous User",
      avatarUrl: `https://picsum.photos/seed/${user?.id || 'taskUser'}/40/40`,
      timestamp: new Date().toISOString(),
      text: newTaskCommentText,
      replies: [],
    };

    const updatedTask = {
      ...selectedTask,
      comments: [newComment, ...(selectedTask.comments || [])],
    };

    setProjectData(prevProjectData => {
      if (!prevProjectData) return null;
      const updatedRootTasks = prevProjectData.tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
      
      const newDepartmentsState = JSON.parse(JSON.stringify(prevProjectData.departments || {})) as StoreProject['departments'];
      Object.keys(newDepartmentsState).forEach(deptKeyStr => {
        const deptKey = deptKeyStr as keyof StoreProject['departments'];
        if (newDepartmentsState[deptKey] && (newDepartmentsState[deptKey] as DepartmentDetails).tasks) {
          (newDepartmentsState[deptKey] as DepartmentDetails).tasks = 
          ((newDepartmentsState[deptKey] as DepartmentDetails).tasks || []).map(dTask =>
              dTask.id === selectedTask.id ? updatedTask : dTask
          );
        }
      });

      const finalProjectData = { ...prevProjectData, tasks: updatedRootTasks, departments: newDepartmentsState };
      const projectIndex = mockProjects.findIndex(p => p.id === finalProjectData.id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = finalProjectData;
      }
      return finalProjectData;
    });
    
    setSelectedTask(updatedTask); 
    setNewTaskCommentText("");
    toast({ title: "Comment Added to Task", description: "Your comment has been posted." });
  };

  const handleReplyToTaskComment = (taskId: string, commentId: string, replyText: string) => {
    if (!projectData) return;
    
    let taskToUpdate = projectData.tasks.find(t => t.id === taskId);
    if (!taskToUpdate || !taskToUpdate.comments) return;

    const addReplyRecursively = (currentComments: Comment[]): Comment[] => {
        return currentComments.map(comment => {
            if (comment.id === commentId) {
                const newReply: Comment = {
                    id: `task-reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    author: user?.name || user?.email || "Anonymous User",
                    avatarUrl: `https://picsum.photos/seed/${user?.id || 'taskReplyUser'}/40/40`,
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
    
    const updatedTaskComments = addReplyRecursively(taskToUpdate.comments);
    const updatedTaskWithReply = { ...taskToUpdate, comments: updatedTaskComments };

    setProjectData(prevProjectData => {
      if (!prevProjectData) return null;
      const updatedRootTasks = prevProjectData.tasks.map(t => t.id === taskId ? updatedTaskWithReply : t);

      const newDepartmentsState = JSON.parse(JSON.stringify(prevProjectData.departments || {})) as StoreProject['departments'];
      Object.keys(newDepartmentsState).forEach(deptKeyStr => {
        const deptKey = deptKeyStr as keyof StoreProject['departments'];
        if (newDepartmentsState[deptKey] && (newDepartmentsState[deptKey] as DepartmentDetails).tasks) {
          (newDepartmentsState[deptKey] as DepartmentDetails).tasks = 
          ((newDepartmentsState[deptKey] as DepartmentDetails).tasks || []).map(dTask =>
              dTask.id === taskId ? updatedTaskWithReply : dTask
          );
        }
      });

      const finalProjectData = { ...prevProjectData, tasks: updatedRootTasks, departments: newDepartmentsState };
      const projectIndex = mockProjects.findIndex(p => p.id === finalProjectData.id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = finalProjectData;
      }
      return finalProjectData;
    });
    
    if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTaskWithReply);
    }
    toast({ title: "Reply Posted to Task Comment", description: "Your reply has been added." });
  };


  const handleOpenDepartmentDialog = (title: string, tasks: Task[] = []) => {
    setDepartmentDialogTitle(`${title} - Tasks`);
    setDepartmentDialogTasks(tasks);
    setIsDepartmentTasksDialogOpen(true);
  };

  const projectStatuses: StoreProject['status'][] = [
    "Planning", "Property Finalized", "Project Kickoff", "Execution", 
    "Merchandising", "Recruitment", "Pre-Launch Marketing", "Launched", "Post-Launch Marketing"
  ];


  const { departments = {} } = projectData; 
  const isUserAdminOrHod = currentUserRole === 'admin' || currentUserRole === 'hod';


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="flex-shrink-0">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">{projectData.name}</h1>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Dialog open={isAddTaskDialogOpen} onOpenChange={(isOpen) => {
                setIsAddTaskDialogOpen(isOpen);
                if (!isOpen) { 
                    setNewTaskName("");
                    setNewTaskDepartment("");
                    setNewTaskDescription("");
                    setNewTaskDueDate("");
                    setNewTaskAssignedTo("");
                    setNewTaskPriority("Medium");
                }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Task
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new task. Click save when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskName" className="text-right">
                      Name
                    </Label>
                    <Input id="taskName" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskDepartment" className="text-right">
                      Department
                    </Label>
                    <Select value={newTaskDepartment} onValueChange={(value) => setNewTaskDepartment(value as Department | "")}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPossibleDepartments.map(dept => (
                           <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskAssignedTo" className="text-right">
                      Assign To
                    </Label>
                    <Input id="taskAssignedTo" value={newTaskAssignedTo} onChange={(e) => setNewTaskAssignedTo(e.target.value)} className="col-span-3" placeholder="e.g. John Doe" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskPriority" className="text-right">
                      Priority
                    </Label>
                    <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as TaskPriority)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="taskDescription" className="text-right pt-1">
                      Description
                    </Label>
                    <Textarea id="taskDescription" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} className="col-span-3" placeholder="Optional task description" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskDueDate" className="text-right">
                      Due Date
                    </Label>
                    <Input id="taskDueDate" type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddNewTask}>Save Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Document
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Upload a file and provide its details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="docFile" className="text-right">
                      File
                    </Label>
                    <Input id="docFile" type="file" onChange={handleFileSelected} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="docName" className="text-right">
                      Name
                    </Label>
                    <Input id="docName" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="docType" className="text-right">
                      Type
                    </Label>
                    <Select value={newDocumentType} onValueChange={(value) => setNewDocumentType(value as DocumentFile['type'] | "")}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3D Render">3D Render</SelectItem>
                        <SelectItem value="Property Document">Property Document</SelectItem>
                        <SelectItem value="Marketing Collateral">Marketing Collateral</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newDocumentType === "3D Render" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="docAiHint" className="text-right">
                        AI Hint
                      </Label>
                      <Input id="docAiHint" value={newDocumentDataAiHint} onChange={(e) => setNewDocumentDataAiHint(e.target.value)} className="col-span-3" placeholder="e.g., modern storefront"/>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddNewDocument} disabled={!newDocumentFile}>Save Document</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        {isUserAdminOrHod ? (
          <Select 
            value={projectData.status} 
            onValueChange={(value) => handleProjectStatusChange(value as StoreProject['status'])}
          >
            <SelectTrigger className="w-[200px] flex-shrink-0 text-sm h-8">
              <SelectValue placeholder="Set project status" />
            </SelectTrigger>
            <SelectContent>
              {projectStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={projectData.status === "Launched" ? "default" : "secondary"} className={cn("flex-shrink-0", projectData.status === "Launched" ? "bg-accent text-accent-foreground" : "")}>
            {projectData.status}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>{projectData.location}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Projected Launch Date</p>
            <p className="text-muted-foreground">{projectData.projectedLaunchDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Start Date</p>
            <p className="text-muted-foreground">{projectData.startDate}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium">Overall Progress: {projectData.currentProgress}%</p>
            <Progress value={projectData.currentProgress} className="mt-1" />
          </div>
          {projectData.propertyDetails && (
             <div>
                <p className="text-sm font-medium">Property Status</p>
                <p className="text-muted-foreground">{projectData.propertyDetails.status} - {projectData.propertyDetails.sqft} sqft</p>
            </div>
          )}
           <div>
            <p className="text-sm font-medium">Project Timeline</p>
            <p className="text-muted-foreground">Day {projectData.projectTimeline.currentDay} of {projectData.projectTimeline.totalDays}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="departments">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.property && <DepartmentCard title="Property Team" icon={Landmark} tasks={departments.property.tasks || []} notes={departments.property.notes} onClick={() => handleOpenDepartmentDialog('Property Team', departments.property?.tasks || [])} />}
            {departments.project && <DepartmentCard title="Project Team" icon={Target} tasks={departments.project.tasks || []} notes={departments.project.notes} onClick={() => handleOpenDepartmentDialog('Project Team', departments.project?.tasks || [])}>
                {projectData.threeDRenderUrl && (
                    <div className="my-2">
                        <p className="text-xs font-medium mb-1">3D Store Visual:</p>
                        <Image src={projectData.threeDRenderUrl} alt="3D Store Render" width={300} height={200} className="rounded-md object-cover w-full aspect-video" data-ai-hint="store render" />
                    </div>
                )}
            </DepartmentCard>}
            {departments.merchandising && <DepartmentCard title="Merchandising Team" icon={Paintbrush} tasks={departments.merchandising.tasks || []} notes={departments.merchandising.virtualPlanUrl ? `Virtual Plan: ${departments.merchandising.virtualPlanUrl}` : undefined} onClick={() => handleOpenDepartmentDialog('Merchandising Team', departments.merchandising?.tasks || [])} />}
            {departments.hr && <DepartmentCard title="HR Team" icon={Users} tasks={departments.hr.tasks || []} notes={departments.hr.recruitmentStatus} onClick={() => handleOpenDepartmentDialog('HR Team', departments.hr?.tasks || [])}>
              {departments.hr.totalNeeded && (
                 <p className="text-xs text-muted-foreground">Staff: {departments.hr.staffHired || 0} / {departments.hr.totalNeeded} hired</p>
              )}
            </DepartmentCard>}
            {departments.marketing && <DepartmentCard title="Marketing Team" icon={Volume2} tasks={departments.marketing.tasks || []} onClick={() => handleOpenDepartmentDialog('Marketing Team', departments.marketing?.tasks || [])}>
              {departments.marketing.preLaunchCampaigns && departments.marketing.preLaunchCampaigns.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium mb-1">Pre-Launch Campaigns:</p>
                  <ul className="space-y-0.5 text-xs">
                    {departments.marketing.preLaunchCampaigns.slice(0,2).map(c => <li key={c.id}>{c.name} ({c.status})</li>)}
                    {departments.marketing.preLaunchCampaigns.length > 2 && <li>+{departments.marketing.preLaunchCampaigns.length - 2} more</li>}
                  </ul>
                </div>
              )}
            </DepartmentCard>}
            {departments.it && (
                <DepartmentCard title="IT Team" icon={MilestoneIcon} tasks={departments.it.tasks || []} notes={departments.it.notes} onClick={() => handleOpenDepartmentDialog('IT Team', departments.it?.tasks || [])}/>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks ({projectData.tasks.length})</CardTitle>
              <CardDescription>Comprehensive list of tasks for this project.</CardDescription>
            </CardHeader>
            <CardContent>
              {projectData.tasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectData.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                           <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-left whitespace-normal text-base"
                              onClick={() => handleViewTaskDetails(task)}
                            >
                              {task.name}
                            </Button>
                        </TableCell>
                        <TableCell>{task.department}</TableCell>
                        <TableCell><Badge variant={task.status === "Completed" ? "outline" : "secondary"}>{task.status}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{task.dueDate || "N/A"}</TableCell>
                        <TableCell className="text-right">{task.assignedTo || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No tasks assigned to this project yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({projectData.documents.length})</CardTitle>
              <CardDescription>All project-related documents.</CardDescription>
            </CardHeader>
            <CardContent>
               {projectData.documents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projectData.documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                       {(doc.type === "3D Render" && doc.url.startsWith("blob:")) || (doc.type === "3D Render" && doc.url.startsWith("https")) ? (
                         <Image src={doc.url} alt={doc.name} width={300} height={150} className="w-full h-32 object-cover" data-ai-hint={doc.dataAiHint || "office document"} />
                       ) : (
                         <div className="h-32 bg-muted flex items-center justify-center">
                           <FileText className="w-12 h-12 text-muted-foreground" />
                         </div>
                       )}
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} - {doc.size}</p>
                        <p className="text-xs text-muted-foreground">Uploaded: {doc.uploadedAt} by {doc.uploadedBy || "System"}</p>
                      </CardContent>
                      <CardFooter className="p-3 border-t">
                         <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" download={!doc.url.startsWith("blob:") && !doc.url.startsWith("https")}>
                                <Download className="mr-2 h-3.5 w-3.5" /> Download
                            </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No documents uploaded for this project yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Project Milestones &amp; Timeline</CardTitle>
                    <CardDescription>Key dates and progress over the {projectData.projectTimeline.totalDays}-day plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative pl-6">
                        <div className="absolute left-[calc(0.75rem-1px)] top-2 bottom-2 w-0.5 bg-border"></div>
                        {projectData.milestones.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((milestone, index) => (
                            <div key={milestone.id} className="relative mb-6">
                                <div className={cn(
                                    "absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full",
                                    milestone.completed ? "bg-accent" : "bg-muted border-2 border-accent"
                                )}>
                                    {milestone.completed ? (
                                        <CheckCircle className="h-4 w-4 text-accent-foreground" />
                                    ) : (
                                        <MilestoneIcon className="h-3 w-3 text-accent" />
                                    )}
                                </div>
                                <div className="ml-6">
                                    <h4 className="font-semibold">{milestone.name}</h4>
                                    <p className="text-sm text-muted-foreground"><CalendarDays className="inline h-3.5 w-3.5 mr-1"/>{milestone.date}</p>
                                    {milestone.description && <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>}
                                </div>
                            </div>
                        ))}
                        
                        {projectData.status !== "Launched" && projectData.status !== "Planning" && (
                             <div className="relative mt-8 mb-6">
                                <div className="absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-primary-foreground shadow">
                                    <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                                </div>
                                <div className="ml-6">
                                    <h4 className="font-semibold text-primary">Current Day: {projectData.projectTimeline.currentDay}</h4>
                                    <p className="text-sm text-muted-foreground">Project is ongoing.</p>
                                </div>
                            </div>
                        )}

                         <div className="relative mt-8">
                                <div className={cn("absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full",
                                projectData.status === "Launched" ? "bg-accent" : "bg-muted border-2 border-primary"
                                )}>
                                    {projectData.status === "Launched" ? <CheckCircle className="h-4 w-4 text-accent-foreground" /> : <Target className="h-3.5 w-3.5 text-primary" />}
                                </div>
                                <div className="ml-6">
                                    <h4 className="font-semibold">{projectData.status === "Launched" ? "Launched!" : "Projected Launch"}</h4>
                                    <p className="text-sm text-muted-foreground"><CalendarDays className="inline h-3.5 w-3.5 mr-1"/>{projectData.projectedLaunchDate}</p>
                                </div>
                            </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Discussion ({projectComments.length})</CardTitle>
              <CardDescription>Share updates, ask questions, and collaborate with the team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10 mt-1 flex-shrink-0">
                  <AvatarImage src={`https://picsum.photos/seed/${user?.id || 'currentUser'}/40/40`} alt={user?.name || "Current User"} data-ai-hint="user avatar" />
                  <AvatarFallback>{(user?.name || user?.email || "CU").substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment} disabled={!newCommentText.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>

              {projectComments.length > 0 ? (
                <div className="space-y-0"> 
                  {projectComments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} onReply={handleReplyToComment} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No comments yet. Be the first to start the discussion!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isViewTaskDialogOpen} onOpenChange={(isOpen) => {
        setIsViewTaskDialogOpen(isOpen);
        if (!isOpen) {
            setSelectedTask(null); 
            setEditingTaskStatus("");
            setEditingTaskAssignedTo("");
            setEditingSelectedTaskDepartment("");
            setEditingSelectedTaskPriority("");
            setNewTaskCommentText(""); 
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask?.name || "Task Details"}</DialogTitle>
            <DialogDescription>
              View or update task details and manage comments.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <ScrollArea className="max-h-[70vh] pr-6">
              <div className="grid gap-4 py-4 text-sm">
                 <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="taskDepartmentEdit" className="text-right text-muted-foreground">Department:</Label>
                  <Select 
                      value={editingSelectedTaskDepartment} 
                      onValueChange={(value) => setEditingSelectedTaskDepartment(value as Department | "")}
                      disabled={!isUserAdminOrHod}
                    >
                        <SelectTrigger id="taskDepartmentEdit" className="col-span-2">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {allPossibleDepartments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="taskPriorityEdit" className="text-right text-muted-foreground">Priority:</Label>
                  <Select 
                      value={editingSelectedTaskPriority} 
                      onValueChange={(value) => setEditingSelectedTaskPriority(value as TaskPriority | "")}
                      disabled={!isUserAdminOrHod}
                    >
                      <SelectTrigger id="taskPriorityEdit" className="col-span-2">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="taskStatusEdit" className="text-right text-muted-foreground">Status:</Label>
                  <Select 
                      value={editingTaskStatus} 
                      onValueChange={(value) => setEditingTaskStatus(value as Task['status'] | "")}
                    >
                        <SelectTrigger id="taskStatusEdit" className="col-span-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
                {selectedTask.description && (
                  <div className="grid grid-cols-3 items-start gap-2">
                    <Label className="text-right text-muted-foreground pt-1">Description:</Label>
                    <div className="col-span-2 whitespace-pre-wrap">{selectedTask.description}</div>
                  </div>
                )}
                {selectedTask.dueDate && (
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-right text-muted-foreground">Due Date:</Label>
                    <div className="col-span-2">{selectedTask.dueDate}</div>
                  </div>
                )}
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="taskAssignedToEdit" className="text-right text-muted-foreground">Assigned To:</Label>
                  <Input 
                      id="taskAssignedToEdit"
                      value={editingTaskAssignedTo} 
                      onChange={(e) => setEditingTaskAssignedTo(e.target.value)} 
                      className="col-span-2"
                      placeholder="Assignee name"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="text-md font-semibold mb-3">Task Comments ({selectedTask.comments?.length || 0})</h3>
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-9 w-9 mt-1 flex-shrink-0">
                    <AvatarImage src={`https://picsum.photos/seed/${user?.id || 'currentUserTaskComment'}/40/40`} alt={user?.name || "Current User"} data-ai-hint="user avatar" />
                    <AvatarFallback>{(user?.name || user?.email || "CU").substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment for this task..."
                      value={newTaskCommentText}
                      onChange={(e) => setNewTaskCommentText(e.target.value)}
                      className="mb-2"
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handlePostNewTaskComment} disabled={!newTaskCommentText.trim()} size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" /> Post Task Comment
                      </Button>
                    </div>
                  </div>
                </div>
                {(selectedTask.comments && selectedTask.comments.length > 0) ? (
                  <div className="space-y-0">
                    {selectedTask.comments.map(comment => (
                      <CommentCard 
                        key={comment.id} 
                        comment={comment} 
                        onReply={(commentId, replyText) => handleReplyToTaskComment(selectedTask.id, commentId, replyText)} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments for this task yet.</p>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateTaskDetails} 
              disabled={!selectedTask || 
                (editingTaskStatus === selectedTask?.status && 
                 editingTaskAssignedTo === (selectedTask?.assignedTo || "") &&
                 editingSelectedTaskDepartment === selectedTask?.department &&
                 editingSelectedTaskPriority === (selectedTask?.priority || "Medium")
                )
              }
            >
                Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepartmentTasksDialogOpen} onOpenChange={setIsDepartmentTasksDialogOpen}>
        <DialogContent className="sm:max-w-2xl"> 
          <DialogHeader>
            <DialogTitle>{departmentDialogTitle}</DialogTitle>
            <DialogDescription>
              List of tasks for this department in the current project. Click a task name to view/edit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {departmentDialogTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Assignee</TableHead>
                    <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentDialogTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium text-left whitespace-normal"
                          onClick={() => {
                            setIsDepartmentTasksDialogOpen(false); 
                            handleViewTaskDetails(task); 
                          }}
                        >
                          {task.name}
                        </Button>
                        {task.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={task.status === "Completed" ? "outline" : "secondary"}>{task.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{task.assignedTo || "N/A"}</TableCell>
                      <TableCell className="hidden md:table-cell">{task.dueDate || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center">No tasks found for this department.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    