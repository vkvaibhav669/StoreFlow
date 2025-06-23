
"use client";

import type { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";

interface KanbanTask extends Task {
  projectName: string;
  projectId: string;
}

interface KanbanTaskCardProps {
  task: KanbanTask;
  onViewTask: (task: KanbanTask) => void;
}

export function KanbanTaskCard({ task, onViewTask }: KanbanTaskCardProps) {
  const priorityColors: Record<string, string> = {
    High: "bg-red-500/20 text-red-700 border-red-500/50",
    Medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
    Low: "bg-green-500/20 text-green-700 border-green-500/50",
    None: "bg-gray-500/20 text-gray-700 border-gray-500/50",
  };

  return (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-medium leading-tight">{task.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Project: {task.projectName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {task.assignedTo && (
          <p className="text-xs text-muted-foreground mb-1">
            Assigned to: {task.assignedTo}
          </p>
        )}
        {task.priority && (
          <Badge 
            variant="outline" 
            className={`text-xs mb-2 ${priorityColors[task.priority] || priorityColors.None}`}
          >
            {task.priority} Priority
          </Badge>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
        )}
         <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1" onClick={() => onViewTask(task)}>
            View Task
        </Button>
      </CardContent>
    </Card>
  );
}
