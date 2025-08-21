
"use client";

import * as React from "react";
import Link from "next/link";
import { getTasksForUser } from "@/lib/api"; 
import type { UserTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Package2 } from "lucide-react"; 
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function MyAssignedTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [userTasks, setUserTasks] = React.useState<UserTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
        router.replace('/auth/signin');
        return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        const tasks = await getTasksForUser(user.email || user.id || user.name || "");
        setUserTasks(tasks as UserTask[]);
      } catch (error) {
        console.error('Error loading page data:', error);
        toast({
          title: "Error",
          description: "Failed to load your tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, authLoading, toast, router]);

  if (authLoading || loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
    );
  }
  
  if (!user) {
      return null; // Should be redirected
  }

  return (
    <section className="my-assigned-tasks-content flex flex-col gap-6" aria-labelledby="my-tasks-heading">
      <h1 id="my-tasks-heading" className="text-2xl font-semibold md:text-3xl mt-4">Task assigned to me</h1>
      
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
    </section>
  );
}
