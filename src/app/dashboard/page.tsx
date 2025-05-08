import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockProjects } from "@/lib/data";
import type { StoreProject } from "@/types";
import { ArrowUpRight, ListFilter, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function ProjectCard({ project }: { project: StoreProject }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{project.name}</CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          {project.location} - Projected Launch: {project.projectedLaunchDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          Status: <Badge variant={project.status === "Launched" ? "default" : "secondary"} className={project.status === "Launched" ? "bg-accent text-accent-foreground" : ""}>{project.status}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">Progress: {project.currentProgress}%</div>
        <Progress value={project.currentProgress} aria-label={`${project.currentProgress}% complete`} className="mt-1" />
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" className="w-full">
          <Link href={`/projects/${project.id}`}>
            View Details <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function DashboardPage() {
  const activeProjects = mockProjects.filter(p => p.status !== "Launched");
  const launchedProjects = mockProjects.filter(p => p.status === "Launched");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Project Dashboard</h1>
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Launched</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Planning
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Project
              </span>
            </Button>
          </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Active Projects ({activeProjects.length})</h2>
        {activeProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No active projects.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recently Launched ({launchedProjects.length})</h2>
         {launchedProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {launchedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recently launched projects.</p>
        )}
      </section>
    </div>
  );
}
