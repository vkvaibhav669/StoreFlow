
"use client";

import * as React from "react";
import { mockProjects } from "@/lib/data";
import type { Task, StoreProject, Department } from "@/types";
import { KanbanTaskCard } from "@/components/kanban/KanbanTaskCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Package2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar
import { cn } from "@/lib/utils"; // Import cn

interface KanbanTask extends Task {
  projectName: string;
  projectId: string;
}

type TaskStatus = Task["status"];
const KANBAN_COLUMNS: TaskStatus[] = ["Pending", "In Progress", "Blocked", "Completed"];

const allPossibleDepartments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

export default function KanbanBoardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar(); // Get sidebar state

  const [tasksWithProjectInfo, setTasksWithProjectInfo] = React.useState<KanbanTask[]>([]);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | "All">("All");
  const [selectedProject, setSelectedProject] = React.useState<string | "All">("All");

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    const allTasks: KanbanTask[] = [];
    mockProjects.forEach((project) => {
      project.tasks.forEach((task) => {
        allTasks.push({
          ...task,
          projectName: project.name,
          projectId: project.id,
        });
      });
    });
    setTasksWithProjectInfo(allTasks);
  }, []);

  const filteredTasks = React.useMemo(() => {
    return tasksWithProjectInfo.filter((task) => {
        const isSpecificDepartmentSelected = selectedDepartment !== "All";
        const isSpecificProjectSelected = selectedProject !== "All";

        if (isSpecificDepartmentSelected && isSpecificProjectSelected) {
            return task.department === selectedDepartment || task.projectId === selectedProject;
        } else if (isSpecificDepartmentSelected) {
            return task.department === selectedDepartment;
        } else if (isSpecificProjectSelected) {
            return task.projectId === selectedProject;
        } else {
            return true;
        }
    });
  }, [tasksWithProjectInfo, selectedDepartment, selectedProject]);

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

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{loading ? "Loading Kanban board..." : "Please sign in."}</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl">Kanban Board</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="project-filter" className="text-xs text-muted-foreground">Filter by Project</Label>
            <Select value={selectedProject} onValueChange={(value) => setSelectedProject(value)}>
              <SelectTrigger id="project-filter" className="h-9">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Projects</SelectItem>
                {mockProjects.map((project) => (
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
        </div>
      </div>

      <ScrollArea className="flex-grow">
        <div className="flex gap-4 pb-4 min-w-max">
          {KANBAN_COLUMNS.map((status) => (
            <Card 
              key={status} 
              className={cn(
                "flex-shrink-0 h-full flex flex-col transition-all duration-300 ease-in-out", 
                sidebarOpen ? "w-[220px]" : "w-[280px]" // Dynamically set width
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
    </div>
  );
}
