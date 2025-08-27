
"use client";

import type { Task, TaskPriority } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface KanbanTask extends Task {
  projectName: string;
  projectId: string;
}

interface KanbanTaskCardProps {
  task: KanbanTask;
  onViewTask: (task: KanbanTask) => void;
}

export function KanbanTaskCard({ task, onViewTask }: KanbanTaskCardProps) {
  const priorityClasses: Record<TaskPriority, string> = {
    High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    None: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700",
  };

  return (
    <div className="mb-3">
        <button className="w-full text-left" onClick={() => onViewTask(task)} aria-label={`View task: ${task.name}`}>
            <Card className="shadow-sm hover:shadow-md hover:bg-accent/50 transition-shadow">
                <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm font-medium leading-tight">{task.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                    Project: {task.projectName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-1 space-y-1.5">
                    {task.priority && (
                    <Badge
                        variant="outline"
                        className={cn("text-xs font-normal", priorityClasses[task.priority] || priorityClasses.None)}
                    >
                        {task.priority} Priority
                    </Badge>
                    )}
                    {task.assignedTo && (
                    <p className="text-xs text-muted-foreground truncate">
                        To: {task.assignedTo}
                    </p>
                    )}
                    {task.dueDate && (
                    <p className="text-xs text-muted-foreground">Due: {format(new Date(task.dueDate), "dd MMM")}</p>
                    )}
                </CardContent>
            </Card>
      </button>
    </div>
  );
}
