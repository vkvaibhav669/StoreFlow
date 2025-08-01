
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAllProjects, createProject } from "@/lib/api";
import type { StoreProject, Department, StoreType } from "@/types";
import { ArrowUpRight, ListFilter, PlusCircle, Package2, Store, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, addDays } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function ProjectCard({ project }: { project: StoreProject }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.name}</CardTitle>
          {project.franchiseType && (
            <Badge variant={project.franchiseType === "COCO" ? "default" : "secondary"} className={project.franchiseType === "COCO" ? "bg-primary/80 text-primary-foreground" : ""}>
              {project.franchiseType}
            </Badge>
          )}
        </div>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          {project.location} - Projected Launch: {project.projectedLaunchDate ? new Date(project.projectedLaunchDate).toLocaleDateString() : 'N/A'}
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

const allDepartmentKeys: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations" , "Visual Merchandising"];
const allStoreTypes: StoreType[] = ["COCO", "FOFO"];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Use async data fetching for projects
  const [dashboardProjects, setDashboardProjects] = React.useState<StoreProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = React.useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = React.useState(false); // Keep for dialog submission UX
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectLocation, setNewProjectLocation] = React.useState("");
  const [newProjectFranchiseType, setNewProjectFranchiseType] = React.useState<StoreType>("COCO");
  const [selectedDepartments, setSelectedDepartments] = React.useState<Record<Department, boolean>>(
    allDepartmentKeys.reduce((acc, curr) => {
      acc[curr] = false;
      return acc;
    }, {} as Record<Department, boolean>)
  );
  const [markAsUpcoming, setMarkAsUpcoming] = React.useState(false);

  const [filterSettings, setFilterSettings] = React.useState({
    showUpcoming: true,
    showActive: true,
    showLaunched: true,
    planningOnly: false,
    storeOwnershipFilter: "All" as StoreType | "All",
  });

  const canAddProject = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  // Move useMemo hooks before any early returns to ensure consistent hook ordering
  const upcomingProjects = React.useMemo(() => {
    if (!filterSettings.showUpcoming) return [];
    let projects = dashboardProjects.filter(p => p.isUpcoming && p.status !== "Launched");
    if (filterSettings.storeOwnershipFilter !== "All") {
      projects = projects.filter(p => p.franchiseType === filterSettings.storeOwnershipFilter);
    }
    return projects;
  }, [dashboardProjects, filterSettings.showUpcoming, filterSettings.storeOwnershipFilter]);

  const activeProjects = React.useMemo(() => {
    if (!filterSettings.showActive) return [];
    let projects = dashboardProjects.filter(p => p.status !== "Launched" && !p.isUpcoming);
    if (filterSettings.planningOnly) {
      projects = projects.filter(p => p.status === "Planning");
    }
    if (filterSettings.storeOwnershipFilter !== "All") {
      projects = projects.filter(p => p.franchiseType === filterSettings.storeOwnershipFilter);
    }
    return projects;
  }, [dashboardProjects, filterSettings.showActive, filterSettings.planningOnly, filterSettings.storeOwnershipFilter]);

  const launchedProjects = React.useMemo(() => {
    if (!filterSettings.showLaunched) return [];
    let projects = dashboardProjects.filter(p => p.status === "Launched");
    if (filterSettings.storeOwnershipFilter !== "All") {
      projects = projects.filter(p => p.franchiseType === filterSettings.storeOwnershipFilter);
    }
    return projects;
  }, [dashboardProjects, filterSettings.showLaunched, filterSettings.storeOwnershipFilter]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
    
    // Fetch projects asynchronously
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getAllProjects();
        setDashboardProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user, authLoading, router, toast]);

  // Refresh projects from API after adding one
  const refreshProjects = async () => {
    try {
      const data = await getAllProjects();
      setDashboardProjects(data);
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  };

  if (authLoading || loading || (!user && !authLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading dashboard..." : "Please sign in to view the dashboard."}</p>
        {!authLoading && !user && (
          <Button onClick={() => router.push('/auth/signin')} className="mt-4">
            Go to Sign In
          </Button>
        )}
      </div>
    );
  }

  const handleDepartmentChange = (department: Department, checked: boolean) => {
    setSelectedDepartments(prev => ({ ...prev, [department]: checked }));
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim() || !newProjectLocation.trim()) {
      toast({ title: "Validation Error", description: "Project Name and Location are required.", variant: "destructive" });
      return;
    }
    if (!canAddProject) {
      toast({ title: "Permission Denied", description: "You do not have permission to add projects.", variant: "destructive" });
      return;
    }

    setIsSubmittingProject(true);
    const today = new Date();
    
    const projectDepartmentsData: Partial<StoreProject['departments']> = {};
    allDepartmentKeys.forEach(dept => {
      if (selectedDepartments[dept]) {
        const deptKey = dept.toLowerCase() as keyof StoreProject['departments'];
        if (dept === "Marketing") {
          projectDepartmentsData[deptKey] = { tasks: [], preLaunchCampaigns: [], postLaunchCampaigns: [] };
        } else {
          projectDepartmentsData[deptKey] = { tasks: [] };
        }
      }
    });

    const newProjectPayload: Partial<StoreProject> = {
      name: newProjectName,
      location: newProjectLocation,
      franchiseType: newProjectFranchiseType,
      status: "Planning",
      isUpcoming: markAsUpcoming,
      startDate: formatDate(today),
      projectedLaunchDate: formatDate(addDays(today, 60)),
      currentProgress: 0,
      propertyDetails: {
        address: newProjectLocation,
        sqft: 0,
        status: 'Identified',
        notes: 'Newly added project.',
      },
      projectTimeline: {
        totalDays: 60,
        currentDay: 0,
        kickoffDate: formatDate(today),
      },
      tasks: [],
      documents: [],
      milestones: [],
      departments: projectDepartmentsData,
      comments: [],
    };

    try {
      const createdProject = await createProject(newProjectPayload);
      await refreshProjects(); // Re-fetch all to include new one
      toast({ title: "Project Created", description: `Project "${createdProject.name}" has been successfully created.` });

      setNewProjectName("");
      setNewProjectLocation("");
      setNewProjectFranchiseType("COCO");
      setSelectedDepartments(allDepartmentKeys.reduce((acc, curr) => ({ ...acc, [curr]: false }), {} as Record<Department, boolean>));
      setMarkAsUpcoming(false);
      setIsAddProjectDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({ title: "Error", description: "Failed to create project. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingProject(false);
    }
  };

  return (
    <section className="dashboard-content flex flex-col gap-6" aria-labelledby="dashboard-main-heading">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 id="dashboard-main-heading" className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">Project Dashboard</h1>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
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
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuCheckboxItem
                  checked={filterSettings.showUpcoming}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({ ...prev, showUpcoming: !!checked }))}
                >
                  Upcoming
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterSettings.showActive}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({ ...prev, showActive: !!checked }))}
                >
                  Active (Not Upcoming)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterSettings.showLaunched}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({ ...prev, showLaunched: !!checked }))}
                >
                  Launched
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterSettings.planningOnly}
                  onCheckedChange={(checked) => setFilterSettings(prev => ({ ...prev, planningOnly: !!checked }))}
                  disabled={!filterSettings.showActive}
                >
                  Planning (within Active)
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Store Ownership</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={filterSettings.storeOwnershipFilter}
                  onValueChange={(value) =>
                    setFilterSettings((prev) => ({ ...prev, storeOwnershipFilter: value as StoreType | "All" }))
                  }
                >
                  <DropdownMenuRadioItem value="All">All Types</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="COCO">COCO</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="FOFO">FOFO</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {canAddProject && (
              <Dialog open={isAddProjectDialogOpen} onOpenChange={(isOpen) => {
                  setIsAddProjectDialogOpen(isOpen);
                  if (!isOpen) {
                      setNewProjectName("");
                      setNewProjectLocation("");
                      setNewProjectFranchiseType("COCO");
                      setSelectedDepartments(allDepartmentKeys.reduce((acc, curr) => ({ ...acc, [curr]: false }), {} as Record<Department, boolean>));
                      setMarkAsUpcoming(false);
                  }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1" disabled={isSubmittingProject}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Project
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                      Enter the details for your new store project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="projectName" className="sm:text-right">
                        Name
                      </Label>
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="sm:col-span-3"
                        placeholder="e.g., City Center Flagship"
                        disabled={isSubmittingProject}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="projectLocation" className="sm:text-right">
                        Location
                      </Label>
                      <Input
                        id="projectLocation"
                        value={newProjectLocation}
                        onChange={(e) => setNewProjectLocation(e.target.value)}
                        className="sm:col-span-3"
                        placeholder="e.g., 789 Market St, Big City"
                        disabled={isSubmittingProject}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="franchiseType" className="sm:text-right">
                        Franchise Type
                      </Label>
                      <Select value={newProjectFranchiseType} onValueChange={(value) => setNewProjectFranchiseType(value as StoreType)} disabled={isSubmittingProject}>
                          <SelectTrigger id="franchiseType" className="sm:col-span-3">
                              <SelectValue placeholder="Select franchise type" />
                          </SelectTrigger>
                          <SelectContent>
                              {allStoreTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label className="sm:text-right pt-2">
                        Departments
                      </Label>
                      <div className="sm:col-span-3 grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-2">
                        {allDepartmentKeys.map(dept => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dept-${dept}`}
                              checked={selectedDepartments[dept]}
                              onCheckedChange={(checked) => handleDepartmentChange(dept, !!checked)}
                              disabled={isSubmittingProject}
                            />
                            <Label htmlFor={`dept-${dept}`} className="font-normal">{dept}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="markUpcoming" className="sm:text-right">
                        Options
                      </Label>
                      <div className="sm:col-span-3 flex items-center space-x-2">
                        <Checkbox
                          id="markUpcoming"
                          checked={markAsUpcoming}
                          onCheckedChange={(checked) => setMarkAsUpcoming(!!checked)}
                          disabled={isSubmittingProject}
                        />
                        <Label htmlFor="markUpcoming" className="font-normal">Mark as Upcoming Project</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button variant="outline" disabled={isSubmittingProject}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddProject} disabled={isSubmittingProject}>
                        {isSubmittingProject ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
      </div>

      {filterSettings.showUpcoming && (
        <section className="upcoming-projects-section">
          <h2 className="text-xl font-semibold mb-4">
            Upcoming Projects ({upcomingProjects.length})
          </h2>
          {upcomingProjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No upcoming projects matching current filters.
            </p>
          )}
        </section>
      )}

      {filterSettings.showActive && (
        <section className="active-projects-section">
          <h2 className="text-xl font-semibold mb-4">
            {filterSettings.planningOnly ? "Planning Projects (Active)" : "Active Projects"} ({activeProjects.length})
          </h2>
          {activeProjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {filterSettings.planningOnly ? "No active projects currently in planning phase." : "No active projects matching filters."}
            </p>
          )}
        </section>
      )}

      {filterSettings.showLaunched && (
        <section className="launched-projects-section">
          <h2 className="text-xl font-semibold mb-4">Recently Launched ({launchedProjects.length})</h2>
          {launchedProjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {launchedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recently launched projects matching current filters.</p>
          )}
        </section>
      )}

      {!filterSettings.showUpcoming && !filterSettings.showActive && !filterSettings.showLaunched && (
         <p className="text-muted-foreground text-center py-8">Select a filter to view projects.</p>
      )}

      <div className="mt-8 pt-6 border-t flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/my-stores">
            <Store className="mr-2 h-5 w-5" />
            My Stores
          </Link>
        </Button>
      </div>
    </section>
  );
}
