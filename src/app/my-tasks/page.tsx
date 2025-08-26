
"use client";

import * as React from "react";
import { createTask } from "@/lib/api"; 
import { getAllProjects, getAllUsers } from "@/lib/api"; 
import type { Task, StoreProject, Department, TaskPriority, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarIcon, Package2, Check, ChevronsUpDown } from "lucide-react"; 
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { useRouter } from "next/navigation";

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations" , "Visual Merchandising"];

export default function AssignTaskPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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
    
    if (!user) {
        router.replace('/auth/signin');
        return;
    }
    if (!canAssignTasks) {
        toast({ title: "Permission Denied", description: "You do not have permission to assign tasks.", variant: "destructive" });
        router.replace('/dashboard');
        return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [projects, users] = await Promise.all([
          getAllProjects(),
          getAllUsers()
        ]);
        setProjectsForAssignment(projects);
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading page data:', error);
        toast({
          title: "Error",
          description: "Failed to load projects or users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, authLoading, toast, router, canAssignTasks]);


  const resetAssignTaskForm = () => {
    setSelectedProjectId("");
    setTaskName("");
    setTaskDescription("");
    setSelectedAssignee(null);
    setSelectedDepartment("");
    setDueDate(undefined);
    setTaskPriority("Medium");
  };

  const handleAssignTaskSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setIsSubmittingTask(true);

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
        const assignedTask = await createTask(selectedProjectId, newTaskPayload); 
        toast({
            title: "Success!",
            description: `Task "${assignedTask.name}" assigned to ${selectedAssignee.name} for project "${targetProject.name}".`,
        });
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
            <p className="text-muted-foreground">Loading task assignment form...</p>
        </div>
    );
  }

  if (!canAssignTasks) {
      return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
                <p className="text-muted-foreground">You do not have permission to access this page.</p>
            </div>
      )
  }

  return (
    <section className="assign-task-content flex flex-col gap-6" aria-labelledby="assign-task-heading">
      <h1 id="assign-task-heading" className="text-2xl font-semibold md:text-3xl mt-4">Assign a Task</h1>
        <Card className="max-w-2xl mx-auto w-full">
            <CardHeader>
            <CardTitle id="assign-task-form-heading" className="text-xl">Assign New Task</CardTitle>
            <CardDescription>Fill in the details below to assign a new task to any user for any project.</CardDescription>
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
                            captionLayout="dropdown-buttons"
                            fromYear={new Date().getFullYear() - 1}
                            toYear={new Date().getFullYear() + 5}
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
    </section>
  );
}
