
"use client";

import * as React from "react";
import { getAllProjects, updateTaskInProject } from "@/lib/data";
import type { Task, StoreProject, Department, TaskPriority } from "@/types";
import { KanbanTaskCard } from "@/components/kanban/KanbanTaskCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Package2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CommentCard } from "@/components/comments/CommentCard";

interface KanbanTask extends Task {
  projectName: string;
  projectId: string;
}

type TaskStatus = Task["status"];
const KANBAN_COLUMNS: TaskStatus[] = ["Pending", "In Progress", "Blocked", "Completed"];
const ALL_TASK_STATUSES: TaskStatus[] = ["Pending", "In Progress", "Completed", "Blocked"];

const allPossibleDepartments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations" , "Visual Merchandising"];
const allPossiblePriorities: TaskPriority[] = ["High", "Medium", "Low", "None"];

export default function TaskTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar();
  const { toast } = useToast();

  const [projects, setProjects] = React.useState<StoreProject[]>([]);
  const [tasksWithProjectInfo, setTasksWithProjectInfo] = React.useState<KanbanTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "All">("All");
  const [selectedProject, setSelectedProject] = React.useState<string | "All">("All");
  const [selectedPriority, setSelectedPriority] = React.useState<TaskPriority | "All">("All");

  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);
  const [isViewTaskDialogOpen, setIsViewTaskDialogOpen] = React.useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = React.useState(false);
  const [editingTaskStatus, setEditingTaskStatus] = React.useState<TaskStatus | "">("");
  const [editingTaskAssignedTo, setEditingTaskAssignedTo] = React.useState<string>("");
  const [showTaskComments, setShowTaskComments] = React.useState(false);

  const refreshTasks = async () => {
    try {
      const updatedProjects = await getAllProjects();
      setProjects(updatedProjects);
      const updatedTasks: KanbanTask[] = [];
      updatedProjects.forEach((project) => {
        (project.tasks || []).forEach((task) => {
          updatedTasks.push({ ...task, projectName: project.name, projectId: project.id });
        });
      });
      setTasksWithProjectInfo(updatedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
    
    const loadTasks = async () => {
      if (user) {
        setLoading(true);
        await refreshTasks();
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [user, authLoading, router]);

  const handleViewTaskDetails = (task: KanbanTask) => {
    setSelectedTask(task);
    setEditingTaskStatus(task.status);
    setEditingTaskAssignedTo(task.assignedTo || "");
    setShowTaskComments(false); // Reset comments visibility on opening
    setIsViewTaskDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask || !user) return;
    
    const canChangeAssignee = user.role === 'Admin' || user.role === 'SuperAdmin';
    if (editingTaskAssignedTo !== (selectedTask.assignedTo || "") && !canChangeAssignee) {
        toast({ title: "Permission Denied", description: "You cannot change the task assignee.", variant: "destructive" });
        return;
    }
    
    setIsUpdatingTask(true);
    const taskUpdatePayload: Partial<Task> = {
      status: editingTaskStatus as TaskStatus,
      assignedTo: editingTaskAssignedTo
    };

    try {
      updateTaskInProject(selectedTask.projectId, selectedTask.id, taskUpdatePayload);
      refreshTasks();
      toast({ title: "Task Updated", description: `Task "${selectedTask.name}" has been updated.` });
      setIsViewTaskDialogOpen(false);
      setSelectedTask(null);
    } catch(error) {
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const filteredTasks = React.useMemo(() => {
    return tasksWithProjectInfo.filter((task) => {
      const projectMatch = selectedProject === "All" || task.projectId === selectedProject;
      const departmentMatch = selectedDepartment === "All" || task.department === selectedDepartment;
      const priorityMatch = selectedPriority === "All" || task.priority === selectedPriority;
      return projectMatch && departmentMatch && priorityMatch;
    });
  }, [tasksWithProjectInfo, selectedProject, selectedDepartment, selectedPriority]);

  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, KanbanTask[]> = {
      Pending: [],
      "In Progress": [],
      Completed: [],
      Blocked: [],
    };
    filteredTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading tasks...</p>
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

  const canEditAssignee = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  return (
    <>
      <section className="task-tracker-container flex flex-col h-[calc(100vh-6rem)] gap-4 p-4 sm:p-6" aria-labelledby="task-tracker-page-heading">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 id="task-tracker-page-heading" className="text-2xl font-semibold md:text-3xl">Task Tracker</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="project-filter" className="text-xs text-muted-foreground">Filter by Project</Label>
              <Select value={selectedProject} onValueChange={(value) => setSelectedProject(value)}>
                <SelectTrigger id="project-filter" className="h-9">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="department-filter" className="text-xs text-muted-foreground">Filter by Department</Label>
              <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value as Department | "All")}>
                <SelectTrigger id="department-filter" className="h-9">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {allPossibleDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="priority-filter" className="text-xs text-muted-foreground">Filter by Priority</Label>
              <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as TaskPriority | "All")}>
                <SelectTrigger id="priority-filter" className="h-9">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priorities</SelectItem>
                  {allPossiblePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-grow">
          <div className="flex gap-4 pb-4 min-w-max">
            {KANBAN_COLUMNS.map((status) => (
              <Card
                key={status}
                className={cn(
                  "h-full flex-shrink-0 flex flex-col",
                  "w-[240px]", 
                  "sm:w-[260px]", 
                  sidebarOpen
                    ? "md:w-[220px] lg:w-[240px]" 
                    : "md:w-[280px] lg:w-[300px]", 
                  "transition-all duration-300 ease-in-out"
                )}
              >
                <CardHeader className="p-3 border-b">
                  <CardTitle className="text-base font-medium flex justify-between items-center">
                    {status}
                    <Badge variant="secondary" className="ml-2">
                      {tasksByStatus[status]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-grow">
                  <CardContent className="p-3 h-full">
                    {tasksByStatus[status] && tasksByStatus[status].length > 0 ? (
                      tasksByStatus[status].map((task) => (
                        <KanbanTaskCard key={task.id} task={task} onViewTask={handleViewTaskDetails} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks in this status.</p>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {selectedTask && (
        <Dialog open={isViewTaskDialogOpen} onOpenChange={setIsViewTaskDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedTask.name}</DialogTitle>
              <DialogDescription>
                From project: {selectedTask.projectName}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid gap-4 py-4 text-sm">
                {selectedTask.description && (
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{selectedTask.description}</p>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Department</Label>
                        <p>{selectedTask.department}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-muted-foreground">Priority</Label>
                        <p>{selectedTask.priority || 'None'}</p>
                    </div>
                    {selectedTask.dueDate && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Due Date</Label>
                            <p>{format(new Date(selectedTask.dueDate), "PPP")}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="taskStatusEdit">Status</Label>
                        <Select value={editingTaskStatus} onValueChange={(value) => setEditingTaskStatus(value as TaskStatus | "")} disabled={isUpdatingTask}>
                          <SelectTrigger id="taskStatusEdit"><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            {ALL_TASK_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taskAssignedToEdit">Assigned To</Label>
                        <Input 
                          id="taskAssignedToEdit" 
                          value={editingTaskAssignedTo} 
                          onChange={(e) => setEditingTaskAssignedTo(e.target.value)} 
                          disabled={isUpdatingTask || !canEditAssignee}
                        />
                        {!canEditAssignee && <p className="text-xs text-muted-foreground">Only Admins can change assignee.</p>}
                    </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTaskComments(!showTaskComments)}
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {showTaskComments ? 'Hide' : 'Show'} Comments ({(selectedTask.comments || []).length})
                </Button>

                {showTaskComments && (
                  <div className="mt-4 space-y-4">
                    {(selectedTask.comments && selectedTask.comments.length > 0) ? (
                      selectedTask.comments.map(comment => (
                        <CommentCard key={comment.id} comment={comment} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No comments on this task yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" disabled={isUpdatingTask}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateTask} disabled={isUpdatingTask}>
                {isUpdatingTask ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
