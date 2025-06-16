
"use client";

import * as React from "react";
import { getAllProjects } from "@/lib/data"; // Changed import
import type { Task, StoreProject, Department, TaskPriority } from "@/types";
import { KanbanTaskCard } from "@/components/kanban/KanbanTaskCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Package2, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"; // Added useToast

interface KanbanTask extends Task {
  projectName: string;
  projectId: string;
}

type TaskStatus = Task["status"];
const KANBAN_COLUMNS: TaskStatus[] = ["Pending", "In Progress", "Blocked", "Completed"];

const allPossibleDepartments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];
const allPossiblePriorities: TaskPriority[] = ["High", "Medium", "Low", "None"];

export default function TaskTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar();
  const { toast } = useToast(); // Initialize toast

  const [projects, setProjects] = React.useState<StoreProject[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(true);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);

  const [tasksWithProjectInfo, setTasksWithProjectInfo] = React.useState<KanbanTask[]>([]);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "All">("All");
  const [selectedProject, setSelectedProject] = React.useState<string | "All">("All");
  const [selectedPriority, setSelectedPriority] = React.useState<TaskPriority | "All">("All");

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (user) {
      const fetchProjectsData = async () => {
        setProjectsLoading(true);
        setProjectsError(null);
        try {
          const fetchedProjects = await getAllProjects();
          setProjects(fetchedProjects);

          const allTasks: KanbanTask[] = [];
          fetchedProjects.forEach((project) => {
            (project.tasks || []).forEach((task) => {
              allTasks.push({
                ...task,
                projectName: project.name,
                projectId: project.id,
              });
            });
          });
          setTasksWithProjectInfo(allTasks);

        } catch (error) {
          console.error("Error fetching projects for Kanban:", error);
          setProjectsError("Failed to load project data for Kanban board.");
          toast({ title: "Error", description: "Could not load project data.", variant: "destructive" });
        } finally {
          setProjectsLoading(false);
        }
      };
      fetchProjectsData();
    }
  }, [user, toast]);

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

  if (authLoading || projectsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Authenticating..." : "Loading tasks..."}</p>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive font-semibold">Error Loading Data</p>
        <p className="text-muted-foreground">{projectsError}</p>
      </div>
    );
  }

  if (!user) { // Fallback if auth checks are somehow bypassed before redirect
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-muted-foreground">Please sign in.</p>
      </div>
    );
  }


  return (
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
                      <KanbanTaskCard key={task.id} task={task} />
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
  );
}
