import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectById } from "@/lib/data";
import type { Task, DocumentFile } from "@/types";
import { ArrowLeft, CalendarDays, CheckCircle, CircleAlert, Clock, Download, FileText, Landmark, MapPin, Milestone as MilestoneIcon, Paintbrush, Paperclip, Target, Users, Volume2 } from "lucide-react"; // Changed PaintBrush to Paintbrush
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";


interface DepartmentCardProps {
  title: string;
  icon: React.ElementType;
  tasks: Task[];
  notes?: string;
  children?: React.ReactNode;
}

function DepartmentCard({ title, icon: Icon, tasks, notes, children }: DepartmentCardProps) {
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {totalTasks > 0 && (
          <CardDescription>{completedTasks} of {totalTasks} tasks completed.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {totalTasks > 0 && <Progress value={progress} className="h-2" />}
        {notes && <p className="text-sm text-muted-foreground italic">{notes}</p>}
        {children}
        {tasks.length > 0 && (
          <ul className="space-y-1 text-sm">
            {tasks.slice(0, 3).map(task => ( // Show max 3 tasks
              <li key={task.id} className="flex items-center justify-between">
                <span className={task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>{task.name}</span>
                <Badge variant={task.status === 'Completed' ? 'outline' : 'secondary'} className="text-xs">
                  {task.status}
                </Badge>
              </li>
            ))}
            {tasks.length > 3 && <li className="text-xs text-muted-foreground text-center">+{tasks.length - 3} more tasks</li>}
          </ul>
        )}
        {tasks.length === 0 && !children && <p className="text-sm text-muted-foreground">No tasks for this department yet.</p>}
      </CardContent>
    </Card>
  );
}


export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const { departments } = project;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard"> {/* Corrected href from /projects to /dashboard as per common navigation patterns */}
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold md:text-3xl">{project.name}</h1>
        <Badge variant={project.status === "Launched" ? "default" : "secondary"} className={cn("ml-auto", project.status === "Launched" ? "bg-accent text-accent-foreground" : "")}>
          {project.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>{project.location}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Projected Launch Date</p>
            <p className="text-muted-foreground">{project.projectedLaunchDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Start Date</p>
            <p className="text-muted-foreground">{project.startDate}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium">Overall Progress: {project.currentProgress}%</p>
            <Progress value={project.currentProgress} className="mt-1" />
          </div>
          {project.propertyDetails && (
             <div>
                <p className="text-sm font-medium">Property Status</p>
                <p className="text-muted-foreground">{project.propertyDetails.status} - {project.propertyDetails.sqft} sqft</p>
            </div>
          )}
           <div>
            <p className="text-sm font-medium">Project Timeline</p>
            <p className="text-muted-foreground">Day {project.projectTimeline.currentDay} of {project.projectTimeline.totalDays}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="departments">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DepartmentCard title="Property Team" icon={Landmark} tasks={departments.property.tasks} notes={departments.property.notes} />
            <DepartmentCard title="Project Team" icon={Target} tasks={departments.project.tasks} notes={departments.project.notes}>
                {project.threeDRenderUrl && (
                    <div className="my-2">
                        <p className="text-xs font-medium mb-1">3D Store Visual:</p>
                        <Image src={project.threeDRenderUrl} alt="3D Store Render" width={300} height={200} className="rounded-md object-cover w-full aspect-video" data-ai-hint="store render" />
                    </div>
                )}
            </DepartmentCard>
            <DepartmentCard title="Merchandising Team" icon={Paintbrush} tasks={departments.merchandising.tasks} notes={departments.merchandising.virtualPlanUrl ? `Virtual Plan: ${departments.merchandising.virtualPlanUrl}` : undefined} />
            <DepartmentCard title="HR Team" icon={Users} tasks={departments.hr.tasks} notes={departments.hr.recruitmentStatus}>
              {departments.hr.totalNeeded && (
                 <p className="text-xs text-muted-foreground">Staff: {departments.hr.staffHired || 0} / {departments.hr.totalNeeded} hired</p>
              )}
            </DepartmentCard>
            <DepartmentCard title="Marketing Team" icon={Volume2} tasks={departments.marketing.tasks}>
              {departments.marketing.preLaunchCampaigns.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium mb-1">Pre-Launch Campaigns:</p>
                  <ul className="space-y-0.5 text-xs">
                    {departments.marketing.preLaunchCampaigns.slice(0,2).map(c => <li key={c.id}>{c.name} ({c.status})</li>)}
                    {departments.marketing.preLaunchCampaigns.length > 2 && <li>+{departments.marketing.preLaunchCampaigns.length - 2} more</li>}
                  </ul>
                </div>
              )}
            </DepartmentCard>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks ({project.tasks.length})</CardTitle>
              <CardDescription>Comprehensive list of tasks for this project.</CardDescription>
            </CardHeader>
            <CardContent>
              {project.tasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.department}</TableCell>
                        <TableCell><Badge variant={task.status === "Completed" ? "outline" : "secondary"}>{task.status}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{task.dueDate || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No tasks assigned to this project yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({project.documents.length})</CardTitle>
              <CardDescription>All project-related documents.</CardDescription>
            </CardHeader>
            <CardContent>
               {project.documents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {project.documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                       {doc.type === "3D Render" && doc.url.startsWith("https") && (
                         <Image src={doc.url} alt={doc.name} width={300} height={150} className="w-full h-32 object-cover" data-ai-hint={doc.dataAiHint || "office document"} />
                       )}
                       {doc.type !== "3D Render" && (
                         <div className="h-32 bg-muted flex items-center justify-center">
                           <FileText className="w-12 h-12 text-muted-foreground" />
                         </div>
                       )}
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} - {doc.size}</p>
                        <p className="text-xs text-muted-foreground">Uploaded: {doc.uploadedAt} by {doc.uploadedBy || "System"}</p>
                      </CardContent>
                      <CardFooter className="p-3 border-t">
                         <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" download={!doc.url.startsWith("https")}>
                                <Download className="mr-2 h-3.5 w-3.5" /> Download
                            </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No documents uploaded for this project yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Project Milestones & Timeline</CardTitle>
                    <CardDescription>Key dates and progress over the 45-day plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative pl-6">
                        {/* Timeline Line */}
                        <div className="absolute left-[calc(0.75rem-1px)] top-2 bottom-2 w-0.5 bg-border"></div>

                        {project.milestones.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((milestone, index) => (
                            <div key={milestone.id} className="relative mb-6">
                                <div className={cn(
                                    "absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full",
                                    milestone.completed ? "bg-accent" : "bg-muted border-2 border-accent"
                                )}>
                                    {milestone.completed ? (
                                        <CheckCircle className="h-4 w-4 text-accent-foreground" />
                                    ) : (
                                        <MilestoneIcon className="h-3 w-3 text-accent" />
                                    )}
                                </div>
                                <div className="ml-6">
                                    <h4 className="font-semibold">{milestone.name}</h4>
                                    <p className="text-sm text-muted-foreground"><CalendarDays className="inline h-3.5 w-3.5 mr-1"/>{milestone.date}</p>
                                    {milestone.description && <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>}
                                </div>
                            </div>
                        ))}
                        
                        {/* Current Day Marker if project is active */}
                        {project.status !== "Launched" && project.status !== "Planning" && (
                             <div className="relative mt-8 mb-6">
                                <div className="absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-primary-foreground shadow">
                                    <Clock className="h-3.5 w-3.5 text-primary-foreground" />
                                </div>
                                <div className="ml-6">
                                    <h4 className="font-semibold text-primary">Current Day: {project.projectTimeline.currentDay}</h4>
                                    <p className="text-sm text-muted-foreground">Project is ongoing.</p>
                                </div>
                            </div>
                        )}

                        {/* Launch Date Marker */}
                         <div className="relative mt-8">
                                <div className={cn("absolute -left-[calc(0.75rem)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full",
                                project.status === "Launched" ? "bg-accent" : "bg-muted border-2 border-primary"
                                )}>
                                    {project.status === "Launched" ? <CheckCircle className="h-4 w-4 text-accent-foreground" /> : <Target className="h-3.5 w-3.5 text-primary" />}
                                </div>
                                <div className="ml-6">
                                    <h4 className="font-semibold">{project.status === "Launched" ? "Launched!" : "Projected Launch"}</h4>
                                    <p className="text-sm text-muted-foreground"><CalendarDays className="inline h-3.5 w-3.5 mr-1"/>{project.projectedLaunchDate}</p>
                                </div>
                            </div>


                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
