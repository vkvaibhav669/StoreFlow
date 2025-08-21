
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  getApprovalRequestsForUser, 
  updateApprovalRequestStatus
} from "@/lib/data";
import type { ApprovalRequest, ApprovalStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Package2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AwaitingApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [requestsAwaitingMyAction, setRequestsAwaitingMyAction] = React.useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refreshApprovalData = React.useCallback(() => {
    if (user) {
      setLoading(true);
      try {
        const approvalData = getApprovalRequestsForUser(user.email);
        setRequestsAwaitingMyAction(approvalData.awaiting);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [user, toast]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
    refreshApprovalData();
  }, [user, authLoading, router, refreshApprovalData]);

  const handleApprovalAction = (requestId: string, newStatus: ApprovalStatus) => {
    if (!user) return;
    try {
      updateApprovalRequestStatus(requestId, { 
        newStatus, 
        actorName: user.name || user.email! 
      });
      toast({
        title: `Request ${newStatus}`,
        description: `The request has been successfully ${newStatus.toLowerCase()}.`,
      });
      refreshApprovalData(); // Re-fetch to update list
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast({
        title: "Error",
        description: "Could not update the request status.",
        variant: "destructive",
      });
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
  
  if (!user) {
    return null; // Should be redirected
  }

  return (
    <section className="awaiting-approvals-content flex flex-col gap-6" aria-labelledby="awaiting-approvals-heading">
      <h1 id="awaiting-approvals-heading" className="text-2xl font-semibold md:text-3xl mt-4">Awaiting My Approval</h1>
      
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
    </section>
  );
}
