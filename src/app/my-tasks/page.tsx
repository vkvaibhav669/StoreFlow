
"use client";

import * as React from "react";
import Link from "next/link";
import { mockProjects } from "@/lib/data";
import type { Task, StoreProject } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface UserTask extends Task {
  projectName: string;
  projectId: string;
}

export default function MyTasksPage() {
  const [userTasks, setUserTasks] = React.useState<UserTask[]>([]);

  React.useEffect(() => {
    const tasksForCurrentUser: UserTask[] = [];
    mockProjects.forEach((project: StoreProject) => {
      project.tasks.forEach((task: Task) => {
        if (task.assignedTo === "Current User") {
          tasksForCurrentUser.push({
            ...task,
            projectName: project.name,
            projectId: project.id,
          });
        }
      });
    });
    setUserTasks(tasksForCurrentUser);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold md:text-3xl">My Tasks</h1>
      
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
                    <TableCell className="hidden md:table-cell">{task.dueDate || "N/A"}</TableCell>
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
    </div>
  );
}
