
"use client";

import * as React from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Users, Mail, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { mockProjects, mockHeadOfficeContacts } from "@/lib/data";
import type { StoreProject, Task, Department, TaskPriority, ProjectMember as HeadOfficeContactType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";


const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

const calculateOverallProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

// Basic email validation helper
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


export default function AssignTaskPage() {
  const { toast } = useToast();
  const { user } = useAuth();

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


  React.useEffect(() => {
    if (assignToSearchTerm.trim() === "") {
      setAssignToSuggestions([]);
      setIsAssignToPopoverOpen(false);
      // Do not clear selectedAssigneeInfo here, allow explicit clear or new selection
      return;
    }

    const searchTermLower = assignToSearchTerm.toLowerCase();
    const filteredContacts = mockHeadOfficeContacts.filter(
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

  }, [assignToSearchTerm]);


  const handleSelectAssignee = (item: HeadOfficeContactType | { type: 'invite'; email: string }) => {
    if ('type' in item && item.type === 'invite') {
      setSelectedAssigneeInfo({ email: item.email, name: item.email });
      setAssignToSearchTerm(item.email); // Show email in input after invite
      toast({
        title: "Mock Invitation",
        description: `A mock invitation will be sent to ${item.email} to collaborate.`,
      });
    } else {
      setSelectedAssigneeInfo({ email: item.email, name: item.name });
      setAssignToSearchTerm(item.name); // Show name in input after selection
    }
    setIsAssignToPopoverOpen(false);
    setAssignToSuggestions([]); 
  };


  const resetForm = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId || !taskName || !selectedDepartment || !selectedAssigneeInfo?.email) {
      toast({
        title: "Error",
        description: "Please fill in Project, Task Name, Department, and select an Assignee.",
        variant: "destructive",
      });
      return;
    }

    const projectIndex = mockProjects.findIndex(p => p.id === selectedProjectId);
    if (projectIndex === -1) {
      toast({
        title: "Error",
        description: "Selected project not found.",
        variant: "destructive",
      });
      return;
    }

    const targetProject = mockProjects[projectIndex];
    
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: taskName,
      department: selectedDepartment as Department,
      description: taskDescription || undefined,
      assignedTo: selectedAssigneeInfo.email,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      status: "Pending",
      priority: taskPriority,
      comments: [],
    };

    targetProject.tasks.push(newTask);

    const deptKey = selectedDepartment.toLowerCase() as keyof StoreProject['departments'];
    
    if (targetProject.departments && targetProject.departments[deptKey]) {
      if (!(targetProject.departments[deptKey] as { tasks: Task[] }).tasks) {
        (targetProject.departments[deptKey] as { tasks: Task[] }).tasks = [];
      }
      (targetProject.departments[deptKey] as { tasks: Task[] }).tasks.push(newTask);
    } else if (targetProject.departments && deptKey === 'it') { 
       targetProject.departments.it = { ...targetProject.departments.it, tasks: [...(targetProject.departments.it?.tasks || []), newTask] };
    } else if (targetProject.departments) { 
        targetProject.departments[deptKey] = { tasks: [newTask] };
    }

    targetProject.currentProgress = calculateOverallProgress(targetProject.tasks);
    
    toast({
      title: "Success!",
      description: `Task "${taskName}" assigned successfully to ${selectedAssigneeInfo.name} for project "${targetProject.name}".`,
    });
    resetForm();
  };

  return (
    <section className="assign-task-container container mx-auto py-10" aria-labelledby="assign-task-heading">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle id="assign-task-heading" className="text-2xl">Assign New Task</CardTitle>
          <CardDescription>Fill in the details below to assign a new task to an individual for a specific project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId} required>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Finalize budget proposal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Task Description (Optional)</Label>
              <Textarea
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Provide more details about the task..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To *</Label>
                <Popover open={isAssignToPopoverOpen} onOpenChange={setIsAssignToPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Input
                      type="text"
                      id="assignedTo"
                      ref={assignToInputRef}
                      placeholder="Type name or email..."
                      value={assignToSearchTerm}
                      onChange={(e) => {
                        setAssignToSearchTerm(e.target.value);
                        setSelectedAssigneeInfo(null); // Clear previous selection on new typing
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
                    />
                  </PopoverTrigger>
                  {assignToSuggestions.length > 0 && (
                    <PopoverContent 
                      className="p-0 w-[--radix-popover-trigger-width]" 
                      side="bottom" 
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()} // Prevents auto-focus stealing from input
                    >
                      <Command>
                        <CommandList>
                          <CommandEmpty>{isValidEmail(assignToSearchTerm) ? "No exact match. You can invite." : "No contacts found."}</CommandEmpty>
                          <CommandGroup>
                            {assignToSuggestions.map((item, index) => (
                              <CommandItem
                                key={('id' in item ? item.id : item.email) + index}
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
                <Label htmlFor="department">Department *</Label>
                <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val as Department | "")} required>
                  <SelectTrigger id="department">
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
                    <Label htmlFor="taskPriority">Priority</Label>
                    <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as TaskPriority)}>
                      <SelectTrigger id="taskPriority">
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
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
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

            <Button type="submit" className="w-full" disabled={!selectedAssigneeInfo?.email && !isValidEmail(assignToSearchTerm)}>
              Assign Task
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
