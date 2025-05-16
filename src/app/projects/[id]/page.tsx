
"use client"; 

import * as React from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectById, mockProjects } from "@/lib/data"; 
import type { Task, DocumentFile, Comment, StoreProject, Department, DepartmentDetails } from "@/types";
import { ArrowLeft, CalendarDays, CheckCircle, Download, FileText, Landmark, Milestone as MilestoneIcon, Paintbrush, Paperclip, PlusCircle, Target, Users, Volume2, Clock, UploadCloud, Eye } from "lucide-react";
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


interface DepartmentCardProps {
  title: string;
  icon: React.ElementType;
  tasks: Task[];
  notes?: string;
  children?: React.ReactNode;
}

function DepartmentCard({ title, icon: Icon, tasks, notes, children }: DepartmentCardProps) {
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card>
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
        {tasks.length > 0 && (
          <ul className="space-y-1 text-sm">
            {tasks.slice(0, 3).map(task => ( 
              <li key={task.id} className="flex items-center justify-between">
                <span className={task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{task.name}</span>
                <Badge variant={task.status === 'Completed' ? 'outline' : 'secondary'} className="text-xs">
                  {task.status}
                </Badge>
              </li>
            ))}
            {tasks.length > 3 && <li className="text-xs text-muted-foreground text-center">+{tasks.length - 3} more tasks</li>}
          </ul>
        )}
        {tasks.length === 0 && !children && <p className="text-sm text-muted-foreground">No tasks for this department yet.</p>}
      </CardContent>
    </Card>
  );
}


export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const [projectData, setProjectData] = React.useState<StoreProject | null>(null);
  const [projectComments, setProjectComments] = React.useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = React.useState("");

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const [newTaskName, setNewTaskName] = React.useState("");
  const [newTaskDepartment, setNewTaskDepartment] = React.useState<Department | "">("");
  const [newTaskDescription, setNewTaskDescription] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = React.useState(false);
  const [newDocumentFile, setNewDocumentFile] = React.useState<File | null>(null);
  const [newDocumentName, setNewDocumentName] = React.useState("");
  const [newDocumentType, setNewDocumentType] = React.useState<DocumentFile['type'] | "">("");
  const [newDocumentDataAiHint, setNewDocumentDataAiHint] = React.useState("");

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isViewTaskDialogOpen, setIsViewTaskDialogOpen] = React.useState(false);


  React.useEffect(() => {
    const currentProject = getProjectById(params.id);
    if (currentProject) {
      setProjectData(currentProject);
      setProjectComments(currentProject.comments || []);
    } else {
      notFound();
    }
  }, [params.id]); 


  if (!projectData) {
    return null; 
  }
  
  const calculateOverallProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleAddNewTask = () => {
    if (!newTaskName || !newTaskDepartment) {
      alert("Task Name and Department are required.");
      return;
    }

    const newTaskToAdd: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newTaskName,
      department: newTaskDepartment as Department,
      description: newTaskDescription || undefined,
      dueDate: newTaskDueDate || undefined,
      status: "Pending",
    };
    
    setProjectData(prevProjectData => {
      if (!prevProjectData) return null;

      const updatedRootTasks = [...prevProjectData.tasks, newTaskToAdd];
      
      const newDepartmentsState = JSON.parse(JSON.stringify(prevProjectData.departments)) as StoreProject['departments']; 
      
      for (const deptKey of Object.keys(newDepartmentsState) as Array<keyof typeof newDepartmentsState>) {
        const deptDefinition = newDepartmentsState[deptKey];
        if (deptDefinition) {
            const departmentNameFromKey = (deptKey.charAt(0).toUpperCase() + deptKey.slice(1)) as Department;
            
            newDepartmentsState[deptKey] = {
                ...deptDefinition, 
                tasks: updatedRootTasks.filter(task => task.department === departmentNameFromKey),
            };
        }
      }
      
      if (newTaskToAdd.department === "IT") {
        newDepartmentsState.it = {
          ...(prevProjectData.departments.it || { tasks: [] }), 
          tasks: updatedRootTasks.filter(task => task.department === "IT")
        };
      }

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
      
      return finalUpdatedProjectData;
    });

    setNewTaskName("");
    setNewTaskDepartment("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
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
      alert("File, Document Name, and Document Type are required.");
      return;
    }

    const newDocument: DocumentFile = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newDocumentName,
      type: newDocumentType as DocumentFile['type'], 
      url: newDocumentType === "3D Render" && newDocumentFile.type.startsWith('image/') ? URL.createObjectURL(newDocumentFile) : `https://placehold.co/300x150.png`, 
      size: `${(newDocumentFile.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: "Current User",
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
        author: "Current User", 
        avatarUrl: "https://picsum.photos/seed/currentUser/40/40", 
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
      setNewCommentText("");
    }
  };

  const handleReplyToComment = (commentId: string, replyText: string) => {
    const addReplyRecursively = (currentComments: Comment[]): Comment[] => {
      return currentComments.map(comment => {
        if (comment.id === commentId) {
          const newReply: Comment = {
            id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            author: "Current User", 
            avatarUrl: "https://picsum.photos/seed/replyUser/40/40",
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
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsViewTaskDialogOpen(true);
  };

  const { departments } = projectData;

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
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Task
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
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
                        <SelectItem value="Property">Property</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Merchandising">Merchandising</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taskDescription" className="text-right">
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
        <Badge variant={projectData.status === "Launched" ? "default" : "secondary"} className={cn("flex-shrink-0", projectData.status === "Launched" ? "bg-accent text-accent-foreground" : "")}>
          {projectData.status}
        </Badge>
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DepartmentCard title="Property Team" icon={Landmark} tasks={departments.property.tasks} notes={departments.property.notes} />
            <DepartmentCard title="Project Team" icon={Target} tasks={departments.project.tasks} notes={departments.project.notes}>
                {projectData.threeDRenderUrl && (
                    <div className="my-2">
                        <p className="text-xs font-medium mb-1">3D Store Visual:</p>
                        <Image src={projectData.threeDRenderUrl} alt="3D Store Render" width={300} height={200} className="rounded-md object-cover w-full aspect-video" data-ai-hint="store render" />
                    </div>
                )}
            </DepartmentCard>
            <DepartmentCard title="Merchandising Team" icon={Paintbrush} tasks={departments.merchandising.tasks} notes={departments.merchandising.virtualPlanUrl ? `Virtual Plan: ${departments.merchandising.virtualPlanUrl}` : undefined} />
            <DepartmentCard title="HR Team" icon={Users} tasks={departments.hr.tasks} notes={departments.hr.recruitmentStatus}>
              {departments.hr.totalNeeded && (
                 <p className="text-xs text-muted-foreground">Staff: {departments.hr.staffHired || 0} / {departments.hr.totalNeeded} hired</p>
              )}
            </DepartmentCard>
            <DepartmentCard title="Marketing Team" icon={Volume2} tasks={departments.marketing.tasks}>
              {departments.marketing.preLaunchCampaigns && departments.marketing.preLaunchCampaigns.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium mb-1">Pre-Launch Campaigns:</p>
                  <ul className="space-y-0.5 text-xs">
                    {departments.marketing.preLaunchCampaigns.slice(0,2).map(c => <li key={c.id}>{c.name} ({c.status})</li>)}
                    {departments.marketing.preLaunchCampaigns.length > 2 && <li>+{departments.marketing.preLaunchCampaigns.length - 2} more</li>}
                  </ul>
                </div>
              )}
            </DepartmentCard>
            {departments.it && departments.it.tasks.length > 0 && (
                <DepartmentCard title="IT Team" icon={MilestoneIcon} tasks={departments.it.tasks} notes={departments.it.notes} />
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectData.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                           <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-left whitespace-normal"
                              onClick={() => handleViewTaskDetails(task)}
                            >
                              {task.name}
                            </Button>
                        </TableCell>
                        <TableCell>{task.department}</TableCell>
                        <TableCell><Badge variant={task.status === "Completed" ? "outline" : "secondary"}>{task.status}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{task.dueDate || "N/A"}</TableCell>
                        <TableCell className="text-right">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewTaskDetails(task)}
                                aria-label="View task details"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
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
                  <AvatarImage src="https://picsum.photos/seed/currentUser/40/40" alt="Current User" data-ai-hint="user avatar" />
                  <AvatarFallback>CU</AvatarFallback>
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

      {/* Dialog for Viewing Task Details */}
      <Dialog open={isViewTaskDialogOpen} onOpenChange={setIsViewTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask?.name || "Task Details"}</DialogTitle>
            <DialogDescription>
              Detailed information about the task.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-3 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Department:</Label>
                <div className="col-span-2">{selectedTask.department}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-right text-muted-foreground">Status:</Label>
                <div className="col-span-2">
                    <Badge variant={selectedTask.status === "Completed" ? "outline" : "secondary"}>{selectedTask.status}</Badge>
                </div>
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
              {selectedTask.assignedTo && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-right text-muted-foreground">Assigned To:</Label>
                  <div className="col-span-2">{selectedTask.assignedTo}</div>
                </div>
              )}
            </div>
          )}
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
