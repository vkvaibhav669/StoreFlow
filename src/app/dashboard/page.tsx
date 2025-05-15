
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockProjects } from "@/lib/data";
import type { StoreProject, Department, DepartmentDetails } from "@/types";
import { ArrowUpRight, ListFilter, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, addDays } from "@/lib/utils";

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

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

export default function DashboardPage() {
  const [dashboardProjects, setDashboardProjects] = React.useState<StoreProject[]>(() => [...mockProjects]);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectLocation, setNewProjectLocation] = React.useState("");
  const [selectedDepartments, setSelectedDepartments] = React.useState<Record<Department, boolean>>(
    allDepartmentKeys.reduce((acc, curr) => {
      acc[curr] = false;
      return acc;
    }, {} as Record<Department, boolean>)
  );

  const handleDepartmentChange = (department: Department, checked: boolean) => {
    setSelectedDepartments(prev => ({ ...prev, [department]: checked }));
  };

  const handleAddProject = () => {
    if (!newProjectName.trim() || !newProjectLocation.trim()) {
      alert("Project Name and Location are required.");
      return;
    }

    const today = new Date();
    const newProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const departments: StoreProject['departments'] = {
      property: { tasks: [] },
      project: { tasks: [] },
      merchandising: { tasks: [] },
      hr: { tasks: [] },
      marketing: { tasks: [], preLaunchCampaigns: [], postLaunchCampaigns: [] },
    };

    if (selectedDepartments.IT) {
      departments.it = { tasks: [] };
    }
    // Optionally, add a default task or note to selected departments
    allDepartmentKeys.forEach(deptKey => {
      if (selectedDepartments[deptKey] && departments[deptKey.toLowerCase() as keyof typeof departments]) {
        // Example: Add a default note or task if desired
        // (departments[deptKey.toLowerCase() as keyof typeof departments] as DepartmentDetails).notes = "Initial setup pending.";
      }
    });


    const newProject: StoreProject = {
      id: newProjectId,
      name: newProjectName,
      location: newProjectLocation,
      status: "Planning",
      startDate: formatDate(today),
      projectedLaunchDate: formatDate(addDays(today, 60)),
      currentProgress: 0,
      propertyDetails: {
        address: newProjectLocation,
        sqft: 0, // Default, can be updated later
        status: 'Identified',
        notes: 'Newly added project.',
      },
      projectTimeline: {
        totalDays: 60, // Default
        currentDay: 0,
        kickoffDate: formatDate(today),
      },
      tasks: [],
      documents: [],
      milestones: [],
      departments: departments,
      comments: [],
    };

    mockProjects.push(newProject); // Add to the global mock data
    setDashboardProjects([...mockProjects]); // Update local state to trigger re-render

    // Reset form and close dialog
    setNewProjectName("");
    setNewProjectLocation("");
    setSelectedDepartments(allDepartmentKeys.reduce((acc, curr) => {
      acc[curr] = false;
      return acc;
    }, {} as Record<Department, boolean>));
    setIsAddProjectDialogOpen(false);
  };


  const activeProjects = dashboardProjects.filter(p => p.status !== "Launched");
  const launchedProjects = dashboardProjects.filter(p => p.status === "Launched");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">Project Dashboard</h1>
        <div className="flex items-center gap-2 flex-shrink-0">
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
            
            <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Project
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new store project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectName" className="text-right">
                      Name
                    </Label>
                    <Input 
                      id="projectName" 
                      value={newProjectName} 
                      onChange={(e) => setNewProjectName(e.target.value)} 
                      className="col-span-3" 
                      placeholder="e.g., City Center Flagship"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectLocation" className="text-right">
                      Location
                    </Label>
                    <Input 
                      id="projectLocation" 
                      value={newProjectLocation} 
                      onChange={(e) => setNewProjectLocation(e.target.value)} 
                      className="col-span-3"
                      placeholder="e.g., 789 Market St, Big City"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      Departments
                    </Label>
                    <div className="col-span-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      {allDepartmentKeys.map(dept => (
                        <div key={dept} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dept-${dept}`}
                            checked={selectedDepartments[dept]}
                            onCheckedChange={(checked) => handleDepartmentChange(dept, !!checked)}
                          />
                          <Label htmlFor={`dept-${dept}`} className="font-normal">{dept}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

