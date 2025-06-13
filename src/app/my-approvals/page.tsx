
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { mockApprovalRequests, updateApprovalRequestStatus, mockProjects, addApprovalRequest, mockHeadOfficeContacts } from "@/lib/data";
import type { ApprovalRequest, ApprovalStatus, Department } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Package2, CheckCircle, XCircle, Info, MessageSquare, Send } from "lucide-react";
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
import { format } from "date-fns";

const allPossibleDepartmentsForRequest: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

export default function MyApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State for displaying existing approvals
  const [requestsAwaitingMyAction, setRequestsAwaitingMyAction] = React.useState<ApprovalRequest[]>([]);
  const [mySubmittedRequests, setMySubmittedRequests] = React.useState<ApprovalRequest[]>([]);

  // State for the "Submit New Request" form
  const [requestTitle, setRequestTitle] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(undefined);
  const [requestingDepartment, setRequestingDepartment] = React.useState<Department | "">("");
  const [details, setDetails] = React.useState("");
  const [approverName, setApproverName] = React.useState("");
  const [approverEmail, setApproverEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    } else if (user) {
      const awaiting = mockApprovalRequests.filter(
        req => req.approverEmail === user.email && req.status === "Pending"
      );
      setRequestsAwaitingMyAction(awaiting);

      const submitted = mockApprovalRequests.filter(
        req => req.requestorEmail === user.email
      );
      setMySubmittedRequests(submitted);
    }
  }, [user, authLoading, router]);

  // Effect for new request form's approver logic
  React.useEffect(() => {
    if (requestingDepartment && requestingDepartment !== "") {
      const hod = mockHeadOfficeContacts.find(
        contact => contact.department.toLowerCase() === requestingDepartment.toLowerCase() && contact.role.startsWith("Head of")
      );
      if (hod) {
        setApproverName(hod.name);
        setApproverEmail(hod.email);
      } else {
        setApproverName(`Head of ${requestingDepartment}`);
        setApproverEmail(`${requestingDepartment.toLowerCase()}.hod@storeflow.corp`);
      }
    } else {
      setApproverName("");
      setApproverEmail("");
    }
  }, [requestingDepartment]);


  const handleApprovalAction = (requestId: string, newStatus: ApprovalStatus) => {
    if (!user) return;
    const success = updateApprovalRequestStatus(requestId, newStatus, user.name || user.email);
    if (success) {
      toast({
        title: `Request ${newStatus}`,
        description: `The request has been successfully ${newStatus.toLowerCase()}.`,
      });
      setRequestsAwaitingMyAction(prev => prev.filter(req => req.id !== requestId));
      setMySubmittedRequests(prev =>
        prev.map(req => req.id === requestId ? {...req, status: newStatus, lastUpdateDate: format(new Date(), "yyyy-MM-dd")} : req)
      );
    } else {
      toast({
        title: "Error",
        description: "Could not update the request status.",
        variant: "destructive",
      });
    }
  };

  const handleNewRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to submit a request.", variant: "destructive" });
      setIsSubmitting(false);
      router.push("/auth/signin");
      return;
    }

    if (!requestTitle || !requestingDepartment || !details || !approverName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Title, Department, Details, Approver).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const selectedProject = selectedProjectId ? mockProjects.find(p => p.id === selectedProjectId) : undefined;

    const newRequestData: Omit<ApprovalRequest, 'id' | 'submissionDate' | 'status'> = {
      title: requestTitle,
      projectId: selectedProjectId === "N/A" || !selectedProjectId ? undefined : selectedProjectId,
      projectName: selectedProject?.name,
      requestingDepartment: requestingDepartment as Department,
      requestorName: user.name || user.email!,
      requestorEmail: user.email!,
      details: details,
      approverName: approverName,
      approverEmail: approverEmail,
    };

    const newRequest = addApprovalRequest(newRequestData);
     setMySubmittedRequests(prev => [newRequest, ...prev]); // Add to my submitted requests immediately

    toast({
      title: "Approval Request Submitted",
      description: `Your request "${requestTitle}" has been sent to ${approverName}.`,
    });

    setRequestTitle("");
    setSelectedProjectId(undefined);
    setRequestingDepartment("");
    setDetails("");
    setIsSubmitting(false);
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

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading approvals..." : "Please sign in."}</p>
      </div>
    );
  }

  return (
    <section className="my-approvals-content flex flex-col gap-6" aria-labelledby="my-approvals-heading">
      <h1 id="my-approvals-heading" className="text-2xl font-semibold md:text-3xl mt-4">Approvals Center</h1>
      <Tabs defaultValue="submit-new-request" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit-new-request">Submit New Request</TabsTrigger>
          <TabsTrigger value="my-submitted-requests">My Submitted Requests ({mySubmittedRequests.length})</TabsTrigger>
          <TabsTrigger value="awaiting-my-action">Awaiting My Action ({requestsAwaitingMyAction.length})</TabsTrigger>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newRequestProject">Associated Project (Optional)</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger id="newRequestProject">
                      <SelectValue placeholder="Select a project (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">Not Applicable</SelectItem>
                      {mockProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newRequestingDepartment">Requesting Department *</Label>
                  <Select value={requestingDepartment} onValueChange={(value) => setRequestingDepartment(value as Department | "")} required>
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

                <div className="space-y-2">
                  <Label htmlFor="newRequestDetails">Details / Justification *</Label>
                  <Textarea
                    id="newRequestDetails"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide a detailed explanation for your request..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newRequestApprover">Approver *</Label>
                  <Input
                    id="newRequestApprover"
                    value={approverName}
                    onChange={(e) => {
                      setApproverName(e.target.value);
                      const matchedContact = mockHeadOfficeContacts.find(c => c.name === e.target.value);
                      setApproverEmail(matchedContact ? matchedContact.email : 'manual.approver@storeflow.corp');
                    }}
                    placeholder="Specify who needs to approve this request"
                    required
                  />
                  {requestingDepartment && (
                    <p className="text-xs text-muted-foreground">
                      Defaulting approver to Head of {requestingDepartment}. You can modify if needed.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
                                    <p className="text-right text-muted-foreground/80">- {comment.author} on {format(new Date(comment.timestamp), "PP")}</p>
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

        <TabsContent value="awaiting-my-action" className="mt-4">
          {requestsAwaitingMyAction.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No requests are currently awaiting your action.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requestsAwaitingMyAction.map(req => (
                <Card key={req.id}>
                  <CardHeader>
                    <CardTitle>{req.title}</CardTitle>
                    <CardDescription>
                      From: {req.requestorName} ({req.requestingDepartment})
                      {req.projectName && ` | Project: ${req.projectName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Submitted: {format(new Date(req.submissionDate), "PPP")}</p>
                    <p className="text-sm whitespace-pre-wrap">{req.details}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleApprovalAction(req.id, "Rejected")}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprovalAction(req.id, "Approved")}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}


    