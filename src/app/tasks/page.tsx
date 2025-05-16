
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { mockProjects, getProjectById } from "@/lib/data"; // Assuming getProjectById might be useful, though direct mutation is happening
import type { StoreProject, Task, Department } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

const calculateOverallProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export default function AssignTaskPage() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [taskName, setTaskName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "">("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);

  const resetForm = () => {
    setSelectedProjectId("");
    setTaskName("");
    setTaskDescription("");
    setAssignedTo("");
    setSelectedDepartment("");
    setDueDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !taskName || !selectedDepartment || !assignedTo) {
      toast({
        title: "Error",
        description: "Please fill in Project, Task Name, Department, and Assign To fields.",
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
      assignedTo: assignedTo,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      status: "Pending",
    };

    // Add task to the project's main task list
    targetProject.tasks.push(newTask);

    // Add task to the specific department's task list within the project
    const deptKey = selectedDepartment.toLowerCase() as keyof StoreProject['departments'];
    
    if (targetProject.departments[deptKey]) {
      (targetProject.departments[deptKey] as { tasks: Task[] }).tasks.push(newTask);
    } else if (deptKey === 'it') { // Handle case where IT department might not exist yet
       targetProject.departments.it = { tasks: [newTask] };
    }

    // Recalculate project progress
    targetProject.currentProgress = calculateOverallProgress(targetProject.tasks);
    
    // No need to call setMockProjects if mockProjects is mutated directly and other components re-read it.
    // However, for a more robust solution with proper state management, a centralized state (like Context or Zustand) would be better.

    toast({
      title: "Success!",
      description: `Task "${taskName}" assigned successfully to ${assignedTo} for project "${targetProject.name}".`,
    });
    resetForm();
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Assign New Task</CardTitle>
          <CardDescription>Fill in the details below to assign a new task to an individual for a specific project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
              <Label htmlFor="taskName">Task Name</Label>
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
                <Label htmlFor="assignedTo">Assign To</Label>
                <Input
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val as Department | "")}>
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

            <Button type="submit" className="w-full">Assign Task</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
