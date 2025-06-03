
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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { mockProjects, mockHeadOfficeContacts } from "@/lib/data";
import type { StoreProject, Task, Department, TaskPriority, ProjectMember } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

const calculateOverallProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export default function AssignTaskPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [taskName, setTaskName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState(""); // Will store selected member's name or email
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "">("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [taskPriority, setTaskPriority] = React.useState<TaskPriority>("Medium");
  const [assignToSelf, setAssignToSelf] = React.useState(false);
  const [assignableMembers, setAssignableMembers] = React.useState<ProjectMember[]>([]);

  React.useEffect(() => {
    if (assignToSelf && user) {
      setAssignedTo(user.name || user.email || "Current User");
    } else if (!assignToSelf && assignedTo === (user?.name || user?.email || "Current User")) {
      // If "Assign to me" was checked and now unchecked, clear assignedTo if it was self-assigned
      setAssignedTo("");
    }
  }, [assignToSelf, user, assignedTo]);

  React.useEffect(() => {
    if (selectedProjectId) {
      const project = mockProjects.find(p => p.id === selectedProjectId);
      setAssignableMembers(project?.members || []);
      // Reset assignment when project changes, unless "assign to self" is checked
      if (!assignToSelf) {
        setAssignedTo("");
      }
    } else {
      setAssignableMembers([]);
      if (!assignToSelf) {
        setAssignedTo("");
      }
    }
  }, [selectedProjectId, assignToSelf]);


  const resetForm = () => {
    setSelectedProjectId("");
    setTaskName("");
    setTaskDescription("");
    setAssignedTo("");
    setSelectedDepartment("");
    setDueDate(undefined);
    setTaskPriority("Medium");
    setAssignToSelf(false);
    setAssignableMembers([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAssignedTo = assignToSelf ? (user?.name || user?.email || "Current User") : assignedTo;

    if (!selectedProjectId || !taskName || !selectedDepartment || !finalAssignedTo) {
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
      assignedTo: finalAssignedTo,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      status: "Pending",
      priority: taskPriority,
      comments: [],
    };

    targetProject.tasks.push(newTask);

    const deptKey = selectedDepartment.toLowerCase() as keyof StoreProject['departments'];
    
    if (targetProject.departments && targetProject.departments[deptKey]) {
      // Ensure tasks array exists
      if (!(targetProject.departments[deptKey] as { tasks: Task[] }).tasks) {
        (targetProject.departments[deptKey] as { tasks: Task[] }).tasks = [];
      }
      (targetProject.departments[deptKey] as { tasks: Task[] }).tasks.push(newTask);
    } else if (targetProject.departments && deptKey === 'it') { 
       targetProject.departments.it = { ...targetProject.departments.it, tasks: [...(targetProject.departments.it?.tasks || []), newTask] };
    } else if (targetProject.departments) { // Handle if department key doesn't exist but departments object does
        targetProject.departments[deptKey] = { tasks: [newTask] };
    }


    targetProject.currentProgress = calculateOverallProgress(targetProject.tasks);
    
    toast({
      title: "Success!",
      description: `Task "${taskName}" assigned successfully to ${finalAssignedTo} for project "${targetProject.name}".`,
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
                 <Select
                    value={assignedTo}
                    onValueChange={setAssignedTo}
                    disabled={assignToSelf || !selectedProjectId || assignableMembers.length === 0}
                    required={!assignToSelf}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder={!selectedProjectId ? "Select a project first" : (assignableMembers.length === 0 ? "No members in project" : "Select member")} />
                    </SelectTrigger>
                    <SelectContent>
                      {!selectedProjectId ? (
                        <SelectItem value="" disabled>Select a project first</SelectItem>
                      ) : assignableMembers.length > 0 ? (
                        assignableMembers.map(member => (
                          <SelectItem key={member.email} value={member.name || member.email}>
                            {member.name} ({member.department || 'N/A Dept'})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No members assigned to this project</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                 <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                        id="assignToSelf"
                        checked={assignToSelf}
                        onCheckedChange={(checked) => {
                          const isChecked = !!checked;
                          setAssignToSelf(isChecked);
                          if (isChecked && user) {
                            setAssignedTo(user.name || user.email || "Current User");
                          } else if (!isChecked && assignedTo === (user?.name || user?.email || "Current User")) {
                             setAssignedTo(""); // Clear if previously self-assigned
                          }
                        }}
                        disabled={!user}
                    />
                    <Label htmlFor="assignToSelf" className="text-sm font-normal text-muted-foreground">
                        Assign to me ({user ? (user.name || user.email) : 'Not logged in'})
                    </Label>
                </div>
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

            <Button type="submit" className="w-full">Assign Task</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

