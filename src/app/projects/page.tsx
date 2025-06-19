
"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllProjects } from "@/lib/data";
import type { StoreProject } from "@/types";
import { ArrowUpRight, Package2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useRouter } from "next/navigation"; // Import useRouter

export default function AllProjectsPage() {
  const { user, loading: authLoading } = useAuth(); // Get auth state
  const router = useRouter(); // For redirect
  const { toast } = useToast(); // Keep for any future messages

  // For mock data, fetch directly.
  // No need for loading/error state here as data is immediately available.
  const [projects, setProjects] = React.useState<StoreProject[]>(getAllProjects());

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin"); // Redirect if not authenticated
    }
    // Optionally refresh data if it can change via other components
    setProjects(getAllProjects());
  }, [user, authLoading, router]);


  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading all projects...</p>
      </div>
    );
  }

  // If user is null and auth is not loading, means redirect should have happened or is about to.
  // You can show a minimal message or null.
  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <p className="text-muted-foreground">Please sign in to view projects.</p>
        </div>
    );
  }

  return (
    <section className="all-projects-content flex flex-col gap-6" aria-labelledby="all-projects-heading">
      <div className="flex items-center justify-between gap-4">
        <h1 id="all-projects-heading" className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">All Store Projects</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Projects Overview ({projects.length})</CardTitle>
          <CardDescription>
            A list of all ongoing and completed store launch projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Launch Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{project.location}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={project.status === "Launched" ? "default" : "secondary"} className={project.status === "Launched" ? "bg-accent text-accent-foreground" : ""}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{project.projectedLaunchDate ? new Date(project.projectedLaunchDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/projects/${project.id}`}>
                          View <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No projects found.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
