"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllProjects, getAllUsers, getApprovalRequestsForUser, getMyApprovalRequests, submitApprovalRequest } from "@/lib/api";
import type { ApprovalRequest, ApprovalStatus, Department, StoreProject, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Package2, CheckCircle, XCircle, Send, ChevronsUpDown, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const allPossibleDepartmentsForRequest: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations" , "Visual Merchandising"];

export default function MyApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [mySubmittedRequests, setMySubmittedRequests] = React.useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [allProjects, setAllProjects] = React.useState<StoreProject[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]); // State for all users

  const [requestTitle, setRequestTitle] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(undefined);
  const [requestingDepartment, setRequestingDepartment] = React.useState<Department | "">("");
  const [details, setDetails] = React.useState("");

  // New state for combobox
  const [approver, setApprover] = React.useState<User | null>(null);
  const [isApproverPopoverOpen, setApproverPopoverOpen] = React.useState(false);
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const refreshApprovalData = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // fetch only current user's submitted requests
      const myRequests = await getMyApprovalRequests({ id: (user as any).id, email: user.email });
      setMySubmittedRequests(Array.isArray(myRequests) ? myRequests : []);
    } catch (error) {
      console.error("Error refreshing approval data:", error);
      setMySubmittedRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
    
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          await refreshApprovalData();
          const [projects, users] = await Promise.all([
            getAllProjects(),
            getAllUsers(),
          ]);
          setAllProjects(projects);
          setAllUsers(users.filter(u => u.id !== user.id)); // Exclude self from approver list
        } catch (error) {
          console.error('Error loading data:', error);
          toast({
            title: "Error",
            description: "Failed to load projects or users. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [user, authLoading, router, toast, refreshApprovalData]);

  const handleNewRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to submit a request.", variant: "destructive" });
      setIsSubmitting(false);
      router.push("/auth/signin");
      return;
    }

    // Read requestor id from localStorage (fallback to auth user id)
    let requestorId: string | undefined;
    try {
      const stored = localStorage.getItem('storeflow_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        requestorId = parsed?.id || parsed?._id || undefined;
      }
    } catch (err) {
      console.warn('Failed to parse storeflow_current_user from localStorage', err);
    }
    // final fallback to auth user id if available
    requestorId = requestorId || (user as any).id || (user as any)._id;

    if (!requestTitle || !requestingDepartment || !details || !approver) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Title, Department, Details, and Approver).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const selectedProject = selectedProjectId ? allProjects.find(p => p.id === selectedProjectId) : undefined;

    const newRequestPayload: Partial<ApprovalRequest> = {
      title: requestTitle,
      projectId: selectedProjectId === "N/A" || !selectedProjectId ? undefined : selectedProjectId,
      projectName: selectedProject?.name,
      requestingDepartment: requestingDepartment as Department,
      details: details,
      approverName: approver.name,
      approverEmail: approver.email,
      requestorId, // keep if needed
      requester: {      // <-- ensure backend-required `requester` is present
        id: requestorId,
        name: user.name,
        email: user.email,
      },
    };

    try {
      // pass the full current user so submitApprovalRequest can set headers and requester
      await submitApprovalRequest(newRequestPayload, { id: (user as any).id, email: user.email, name: user.name });
      await refreshApprovalData(); // Re-fetch to update list

      toast({
        title: "Approval Request Submitted",
        description: `Your request "${requestTitle}" has been sent to ${approver.name}.`,
      });

      setRequestTitle("");
      setSelectedProjectId(undefined);
      setRequestingDepartment("");
      setDetails("");
      setApprover(null);
    } catch (error) {
      console.error("Error submitting approval request:", error);
      toast({ title: "Error Submitting Request", description: (error as Error).message || "Failed to submit approval request.", variant: "destructive"});
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: ApprovalStatus) => {
    switch (status) {
      case "Approved": return "default";
      case "Rejected": return "destructive";
      case "Pending": return "secondary";
      case "Withdrawn": return "outline";
      default: return "secondary";
    }
  };

  const getStatusBadgeClass = (status: ApprovalStatus) => {
    switch (status) {
      case "Approved": return "bg-accent text-accent-foreground";
      default: return "";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading approvals...</p>
      </div>
    );
  }

  return (
    <section className="requests-content flex flex-col gap-6" aria-labelledby="requests-heading">
      <h1 id="requests-heading" className="text-2xl font-semibold md:text-3xl mt-4">Requests</h1>
      <Tabs defaultValue="submit-new-request" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit-new-request">Submit New Request</TabsTrigger>
          <TabsTrigger value="my-submitted-requests">My Submitted Requests ({mySubmittedRequests?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="submit-new-request" className="mt-4">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>New Approval Request</CardTitle>
              <CardDescription>Fill out the form below to submit your request for approval.</CardDescription>
            </CardHeader>
            <form onSubmit={handleNewRequestSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newRequestTitle">Request Title / Subject *</Label>
                  <Input
                    id="newRequestTitle"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="e.g., Budget increase for Q3 marketing"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newRequestProject">Associated Project (Optional)</Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isSubmitting}>
                        <SelectTrigger id="newRequestProject">
                          <SelectValue placeholder="Select a project (if applicable)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">Not Applicable</SelectItem>
                          {allProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                          {allProjects.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No projects available.</div>}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newRequestingDepartment">Requesting Department *</Label>
                      <Select value={requestingDepartment} onValueChange={(value) => setRequestingDepartment(value as Department | "")} required disabled={isSubmitting}>
                        <SelectTrigger id="newRequestingDepartment">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {allPossibleDepartmentsForRequest.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newRequestDetails">Details / Justification *</Label>
                  <Textarea
                    id="newRequestDetails"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide a detailed explanation for your request..."
                    rows={5}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newRequestApproverName">Approver *</Label>
                    <Popover open={isApproverPopoverOpen} onOpenChange={setApproverPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="newRequestApproverName"
                          variant="outline"
                          role="combobox"
                          aria-expanded={isApproverPopoverOpen}
                          className="w-full justify-between font-normal"
                          disabled={isSubmitting || allUsers.length === 0}
                        >
                          {approver ? approver.name : allUsers.length === 0 ? "No users found" : "Select approver..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search users..." />
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {allUsers.map((u) => (
                                <CommandItem
                                  key={u.id}
                                  value={u.name}
                                  onSelect={() => {
                                    setApprover(u);
                                    setApproverPopoverOpen(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", approver?.id === u.id ? "opacity-100" : "opacity-0")}/>
                                  <div>
                                    <p>{u.name}</p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newRequestApproverEmail">Approver Email *</Label>
                    <Input
                      id="newRequestApproverEmail"
                      type="email"
                      value={approver ? approver.email : ""}
                      readOnly
                      placeholder="Approver's email will appear here"
                      required
                      className="bg-muted/50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || authLoading || !approver}>
                  {isSubmitting ? "Submitting..." : "Submit Request"} <Send className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="my-submitted-requests" className="mt-4">
          {mySubmittedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">You have not submitted any approval requests yet.</p>
              </CardContent>
            </Card>
          ) : (
             <div className="grid gap-4 md:grid-cols-2">
              {mySubmittedRequests.map(req => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{req.title}</CardTitle>
                            <CardDescription>
                                To: {req.approverName}
                                {req.projectName && ` | Project: ${req.projectName}`}
                            </CardDescription>
                        </div>
                         <Badge variant={getStatusBadgeVariant(req.status)} className={getStatusBadgeClass(req.status)}>
                            {req.status}
                        </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                     <p className="text-sm text-muted-foreground">Submitted: {format(new Date(req.submissionDate), "PPP")}</p>
                     {req.lastUpdateDate && (
                        <p className="text-sm text-muted-foreground">Last Update: {format(new Date(req.lastUpdateDate), "PPP p")}</p>
                     )}
                     <p className="text-sm pt-2 whitespace-pre-wrap">{req.details}</p>
                     {req.approvalComments && req.approvalComments.length > 0 && (
                        <div className="pt-2 mt-2 border-t">
                            <h4 className="text-xs font-semibold mb-1 text-muted-foreground">Approver Comments:</h4>
                            {req.approvalComments.map(comment => (
                                <div key={comment.id} className="text-xs p-2 bg-muted rounded-md">
                                    <p className="italic">"{comment.text}"</p>
                                    <p className="text-right text-muted-foreground/80">- {comment.author || comment.addedByName} on {comment.timestamp || comment.addedAt ? format(new Date(comment.timestamp || comment.addedByName!), "PP") : "Unknown date"}</p>
                                </div>
                            ))}
                        </div>
                     )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
