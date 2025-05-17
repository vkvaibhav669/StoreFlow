
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { mockApprovalRequests, updateApprovalRequestStatus } from "@/lib/data";
import type { ApprovalRequest, ApprovalStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Package2, CheckCircle, XCircle, Info, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // For potential comments on approve/reject
import { format } from "date-fns";


export default function MyApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [requestsAwaitingMyAction, setRequestsAwaitingMyAction] = React.useState<ApprovalRequest[]>([]);
  const [mySubmittedRequests, setMySubmittedRequests] = React.useState<ApprovalRequest[]>([]);
  
  // For handling comments during approve/reject - future enhancement
  // const [actionComment, setActionComment] = React.useState("");
  // const [actingOnRequestId, setActingOnRequestId] = React.useState<string | null>(null);


  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    } else if (user) {
      // Filter requests for "Awaiting My Action"
      const awaiting = mockApprovalRequests.filter(
        req => req.approverEmail === user.email && req.status === "Pending"
      );
      setRequestsAwaitingMyAction(awaiting);

      // Filter requests for "My Submitted Requests"
      const submitted = mockApprovalRequests.filter(
        req => req.requestorEmail === user.email
      );
      setMySubmittedRequests(submitted);
    }
  }, [user, authLoading, router]);


  const handleApprovalAction = (requestId: string, newStatus: ApprovalStatus) => {
    if (!user) return;

    const success = updateApprovalRequestStatus(requestId, newStatus, user.name || user.email /*, actionComment */);
    if (success) {
      toast({
        title: `Request ${newStatus}`,
        description: `The request has been successfully ${newStatus.toLowerCase()}.`,
      });
      // Refresh local state
      setRequestsAwaitingMyAction(prev => prev.filter(req => req.id !== requestId));
      setMySubmittedRequests(prev => 
        prev.map(req => req.id === requestId ? {...req, status: newStatus, lastUpdateDate: format(new Date(), "yyyy-MM-dd")} : req)
      );
      // setActionComment("");
      // setActingOnRequestId(null);
    } else {
      toast({
        title: "Error",
        description: "Could not update the request status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: ApprovalStatus) => {
    switch (status) {
      case "Approved":
        return "default"; // Greenish accent
      case "Rejected":
        return "destructive";
      case "Pending":
        return "secondary";
      case "Withdrawn":
        return "outline";
      default:
        return "secondary";
    }
  };
   const getStatusBadgeClass = (status: ApprovalStatus) => {
    switch (status) {
      case "Approved":
        return "bg-accent text-accent-foreground";
      default:
        return "";
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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold md:text-3xl mt-4">My Approvals</h1>
      <Tabs defaultValue="awaiting-my-action" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="awaiting-my-action">Awaiting My Action ({requestsAwaitingMyAction.length})</TabsTrigger>
          <TabsTrigger value="my-submitted-requests">My Submitted Requests ({mySubmittedRequests.length})</TabsTrigger>
        </TabsList>

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
                    {/* Future: Add textarea for comments here if actingOnRequestId === req.id */}
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
                   <CardFooter>
                    {/* Could add a "Withdraw" button if status is Pending */}
                   </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
