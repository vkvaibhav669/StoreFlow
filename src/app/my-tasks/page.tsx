
"use client";

import * as React from "react";
import Link from "next/link";
import { addTaskToProject } from "@/lib/data"; 
import { getAllProjects, getTasksForUser, getAllUsers } from "@/lib/api"; 
import type { Task, StoreProject, Department, TaskPriority, User, UserTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, CalendarIcon, Users, Mail, Package2, Check, ChevronsUpDown } from "lucide-react"; 
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

export default function MyTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [userTasks, setUserTasks] = React.useState<UserTask[]>([]);
  const [projectsForAssignment, setProjectsForAssignment] = React.useState<StoreProject[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [taskName, setTaskName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  
  const [isAssigneePopoverOpen, setAssigneePopoverOpen] = React.useState(false);
  const [selectedAssignee, setSelectedAssignee] = React.useState<User | null>(null);

  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "">("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [taskPriority, setTaskPriority] = React.useState<TaskPriority>("Medium");
  const [isSubmittingTask, setIsSubmittingTask] = React.useState(false);

  const canAssignTasks = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  React.useEffect(() => {
    if (authLoading) return;
    
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [tasks, projects, users] = await Promise.all([
            getTasksForUser(user.email || user.id || user.name || ""),
            getAllProjects(),
            getAllUsers()
          ]);
          setUserTasks(tasks as UserTask[]);
          setProjectsForAssignment(projects);
          setAllUsers(users);
        } catch (error) {
          console.error('Error loading page data:', error);
          toast({
            title: "Error",
            description: "Failed to load page data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, authLoading, toast]);


  const resetAssignTaskForm = () => {
    setSelectedProjectId("");
    setTaskName("");
    setTaskDescription("");
    setSelectedAssignee(null);
    setSelectedDepartment("");
    setDueDate(undefined);
    setTaskPriority("Medium");
  };

  const handleAssignTaskSubmit = (e: React.FormEvent) => { 
    e.preventDefault();
    setIsSubmittingTask(true);

    if (!canAssignTasks) {
        toast({ title: "Permission Denied", description: "You do not have permission to assign tasks.", variant: "destructive" });
        setIsSubmittingTask(false);
        return;
    }

    if (!selectedProjectId || !taskName || !selectedDepartment || !selectedAssignee) {
      toast({
        title: "Error",
        description: "Please fill in Project, Task Name, Department, and select an Assignee.",
        variant: "destructive",
      });
      setIsSubmittingTask(false);
      return;
    }

    const targetProject = projectsForAssignment.find(p => p.id === selectedProjectId);
    if (!targetProject) {
      toast({ title: "Error", description: "Selected project not found.", variant: "destructive" });
      setIsSubmittingTask(false);
      return;
    }

    const newTaskPayload: Partial<Task> = {
      name: taskName,
      department: selectedDepartment as Department,
      description: taskDescription || undefined,
      assignedTo: selectedAssignee.name, 
      assignedToId: selectedAssignee.id,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      status: "Pending",
      priority: taskPriority,
      comments: [],
    };

    try {
        const assignedTask = addTaskToProject(selectedProjectId, newTaskPayload); 
        toast({
            title: "Success!",
            description: `Task "${assignedTask.name}" assigned to ${selectedAssignee.name} for project "${targetProject.name}".`,
        });
        if (assignedTask.assignedToId === user?.id) {
          const userTask: UserTask = {
            ...assignedTask,
            projectId: selectedProjectId,
            projectName: targetProject.name
          };
          setUserTasks(prev => [userTask, ...prev].sort((a, b) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime()));
        }
        resetAssignTaskForm();
    } catch (error) {
        console.error("Error assigning task:", error);
        toast({ title: "Error Assigning Task", description: (error as Error).message || "Could not assign task.", variant: "destructive" });
    } finally {
        setIsSubmittingTask(false);
    }
  };

  if (authLoading || loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
        </div>
    );
  }

  return (
    <section className="my-tasks-content flex flex-col gap-6" aria-labelledby="my-tasks-heading">
      <h1 id="my-tasks-heading" className="text-2xl font-semibold md:text-3xl mt-4">My Tasks</h1>
      
      <Tabs defaultValue="my-assigned-tasks" className="w-full">
        <TabsList className={cn("grid w-full", canAssignTasks ? "grid-cols-2" : "grid-cols-1")}>
          <TabsTrigger value="my-assigned-tasks">My Assigned Tasks ({userTasks.length})</TabsTrigger>
          {canAssignTasks && <TabsTrigger value="assign-new-task">Assign New Task</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-assigned-tasks" className="mt-4">
          {userTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">You have no tasks assigned to you.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Tasks Assigned to You</CardTitle>
                <CardDescription>
                  Here are the tasks that require your attention across all projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="hidden sm:table-cell">Department</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="font-medium">{task.name}</div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>
                          )}
                        </TableCell>
                        <TableCell>{task.projectName}</TableCell>
                        <TableCell className="hidden sm:table-cell">{task.department}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={task.status === "Completed" ? "outline" : "secondary"}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{task.dueDate ? format(new Date(task.dueDate), "PPP") : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/projects/${task.projectId}`}>
                              View Project <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canAssignTasks && (
          <TabsContent value="assign-new-task" className="mt-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle id="assign-task-form-heading" className="text-xl">Assign New Task</CardTitle>
                <CardDescription>Fill in the details below to assign a new task.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssignTaskSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-assign">Project *</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId} required disabled={isSubmittingTask}>
                      <SelectTrigger id="project-assign">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectsForAssignment.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                         {projectsForAssignment.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No projects available.</div>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taskName-assign">Task Name *</Label>
                    <Input
                      id="taskName-assign"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="e.g., Finalize budget proposal"
                      required
                      disabled={isSubmittingTask}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taskDescription-assign">Task Description (Optional)</Label>
                    <Textarea
                      id="taskDescription-assign"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Provide more details about the task..."
                      rows={3}
                      disabled={isSubmittingTask}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo-assign">Assign To *</Label>
                       <Popover open={isAssigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isAssigneePopoverOpen}
                            className="w-full justify-between font-normal"
                            disabled={isSubmittingTask || allUsers.length === 0}
                          >
                            {selectedAssignee
                              ? selectedAssignee.name
                              : allUsers.length === 0 ? "No users found" : "Select user..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search users..." />
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {allUsers.map((u) => (
                                  <CommandItem
                                    key={u.id}
                                    value={u.name}
                                    onSelect={() => {
                                      setSelectedAssignee(u);
                                      setAssigneePopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedAssignee?.id === u.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div>
                                      <p>{u.name}</p>
                                      <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department-assign">Department *</Label>
                      <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val as Department | "")} required disabled={isSubmittingTask}>
                        <SelectTrigger id="department-assign">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {allDepartmentKeys.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="taskPriority-assign">Priority</Label>
                          <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as TaskPriority)} disabled={isSubmittingTask}>
                            <SelectTrigger id="taskPriority-assign">
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
                      <div className="space-y-2">
                        <Label htmlFor="dueDate-assign">Due Date (Optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              id="dueDate-assign"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDate && "text-muted-foreground"
                              )}
                              disabled={isSubmittingTask}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dueDate}
                              onSelect={setDueDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmittingTask || !selectedAssignee}>
                    {isSubmittingTask ? "Assigning..." : "Assign Task"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
}

