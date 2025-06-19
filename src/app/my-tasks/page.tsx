
"use client";

import * as React from "react";
import Link from "next/link";
import { getAllProjects, mockHeadOfficeContacts, addTaskToProject, getTasksForUser } from "@/lib/data"; 
import type { Task, StoreProject, Department, TaskPriority, ProjectMember as HeadOfficeContactType, UserTask } from "@/types";
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
import { ArrowUpRight, CalendarIcon, Users, Mail, Package2 } from "lucide-react"; 
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function MyTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Synchronous data fetching for mock environment
  const [userTasks, setUserTasks] = React.useState<UserTask[]>([]);
  const [projectsForAssignment, setProjectsForAssignment] = React.useState<StoreProject[]>(getAllProjects());
  const [headOfficeContacts, setHeadOfficeContacts] = React.useState<HeadOfficeContactType[]>(mockHeadOfficeContacts);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [taskName, setTaskName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [assignToSearchTerm, setAssignToSearchTerm] = React.useState("");
  const [assignToSuggestions, setAssignToSuggestions] = React.useState<(HeadOfficeContactType | { type: 'invite'; email: string })[]>([]);
  const [isAssignToPopoverOpen, setIsAssignToPopoverOpen] = React.useState(false);
  const [selectedAssigneeInfo, setSelectedAssigneeInfo] = React.useState<{ email: string; name: string } | null>(null);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "">("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [taskPriority, setTaskPriority] = React.useState<TaskPriority>("Medium");
  const assignToInputRef = React.useRef<HTMLInputElement>(null);
  const [isSubmittingTask, setIsSubmittingTask] = React.useState(false);

  const canAssignTasks = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  React.useEffect(() => {
    if (user && !authLoading) {
      setUserTasks(getTasksForUser(user.email) as UserTask[]);
      // Refresh other data if it could change (though for mock, it's mostly static unless edited elsewhere)
      setProjectsForAssignment(getAllProjects());
      setHeadOfficeContacts(mockHeadOfficeContacts);
    } else if (!authLoading && !user) {
      // router.replace("/auth/signin"); // This is handled by AppLayout
    }
  }, [user, authLoading]);


  React.useEffect(() => {
    if (assignToSearchTerm.trim() === "") {
      setAssignToSuggestions([]);
      setIsAssignToPopoverOpen(false);
      return;
    }

    const searchTermLower = assignToSearchTerm.toLowerCase();
    const filteredContacts = headOfficeContacts.filter( 
      contact =>
        contact.name.toLowerCase().includes(searchTermLower) ||
        contact.email.toLowerCase().includes(searchTermLower)
    );

    const suggestions: (HeadOfficeContactType | { type: 'invite'; email: string })[] = [...filteredContacts];

    if (filteredContacts.length === 0 && isValidEmail(assignToSearchTerm)) {
      suggestions.push({ type: 'invite', email: assignToSearchTerm });
    }

    setAssignToSuggestions(suggestions);
    setIsAssignToPopoverOpen(suggestions.length > 0);

  }, [assignToSearchTerm, headOfficeContacts]);

  const handleSelectAssignee = (item: HeadOfficeContactType | { type: 'invite'; email: string }) => {
    if ('type' in item && item.type === 'invite') {
      setSelectedAssigneeInfo({ email: item.email, name: item.email });
      setAssignToSearchTerm(item.email);
      toast({
        title: "Mock Invitation",
        description: `A mock invitation would be sent to ${item.email} to collaborate if backend supported it.`,
      });
    } else {
      setSelectedAssigneeInfo({ email: item.email, name: item.name });
      setAssignToSearchTerm(item.name);
    }
    setIsAssignToPopoverOpen(false);
    setAssignToSuggestions([]);
  };

  const resetAssignTaskForm = () => {
    setSelectedProjectId("");
    setTaskName("");
    setTaskDescription("");
    setAssignToSearchTerm("");
    setSelectedAssigneeInfo(null);
    setAssignToSuggestions([]);
    setIsAssignToPopoverOpen(false);
    setSelectedDepartment("");
    setDueDate(undefined);
    setTaskPriority("Medium");
  };

  const handleAssignTaskSubmit = (e: React.FormEvent) => { // No async for mock
    e.preventDefault();
    setIsSubmittingTask(true);

    if (!canAssignTasks) {
        toast({ title: "Permission Denied", description: "You do not have permission to assign tasks.", variant: "destructive" });
        setIsSubmittingTask(false);
        return;
    }

    if (!selectedProjectId || !taskName || !selectedDepartment || !selectedAssigneeInfo?.email) {
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
      toast({
        title: "Error",
        description: "Selected project not found.",
        variant: "destructive",
      });
      setIsSubmittingTask(false);
      return;
    }

    const newTaskPayload: Partial<Task> = {
      name: taskName,
      department: selectedDepartment as Department,
      description: taskDescription || undefined,
      assignedTo: selectedAssigneeInfo.email, 
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      status: "Pending",
      priority: taskPriority,
      comments: [],
    };

    try {
        const assignedTask = addTaskToProject(selectedProjectId, newTaskPayload); // Synchronous call
        toast({
            title: "Success!",
            description: `Task "${assignedTask.name}" assigned to ${selectedAssigneeInfo.name} for project "${targetProject.name}".`,
        });
        if (assignedTask.assignedTo === user?.email) {
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

  if (authLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-muted-foreground">Authenticating...</p>
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
                      <Popover open={isAssignToPopoverOpen} onOpenChange={setIsAssignToPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Input
                            type="text"
                            id="assignedTo-assign"
                            ref={assignToInputRef}
                            placeholder="Type name or email..."
                            value={assignToSearchTerm}
                            onChange={(e) => {
                              setAssignToSearchTerm(e.target.value);
                              setSelectedAssigneeInfo(null); 
                              if (e.target.value.trim() !== "") {
                                 setIsAssignToPopoverOpen(true);
                              } else {
                                 setIsAssignToPopoverOpen(false);
                              }
                            }}
                            onFocus={() => {
                              if (assignToSearchTerm.trim() !== "" && assignToSuggestions.length > 0) {
                                setIsAssignToPopoverOpen(true);
                              }
                            }}
                            required={!selectedAssigneeInfo?.email}
                            className="w-full"
                            disabled={isSubmittingTask}
                          />
                        </PopoverTrigger>
                        {assignToSuggestions.length > 0 && (
                          <PopoverContent
                            className="p-0 w-[--radix-popover-trigger-width]"
                            side="bottom"
                            align="start"
                            onOpenAutoFocus={(e) => e.preventDefault()} 
                          >
                            <Command>
                              <CommandList>
                                <CommandEmpty>{isValidEmail(assignToSearchTerm) ? "No exact match. You can invite." : "No contacts found."}</CommandEmpty>
                                <CommandGroup>
                                  {assignToSuggestions.map((item, index) => (
                                    <CommandItem
                                      key={('id' in item && item.id) ? item.id : item.email + index} 
                                      onSelect={() => handleSelectAssignee(item)}
                                      className="cursor-pointer"
                                    >
                                      {'type' in item && item.type === 'invite' ? (
                                        <div className="flex items-center">
                                          <Mail className="mr-2 h-4 w-4" />
                                          <span>Invite {item.email}</span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col">
                                          <div className="flex items-center">
                                             <Users className="mr-2 h-4 w-4" />
                                             <span>{(item as HeadOfficeContactType).name}</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground ml-6">
                                              {(item as HeadOfficeContactType).email} - {(item as HeadOfficeContactType).department || 'N/A Dept'}
                                          </span>
                                        </div>
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        )}
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

                  <Button type="submit" className="w-full" disabled={isSubmittingTask || (!selectedAssigneeInfo?.email && !isValidEmail(assignToSearchTerm))}>
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
