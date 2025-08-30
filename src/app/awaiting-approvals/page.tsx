
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getApprovalRequestsForUser, updateApprovalRequest } from "@/lib/api";
import type { ApprovalRequest, ApprovalStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Package2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

export default function AwaitingApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [requestsAwaitingMyAction, setRequestsAwaitingMyAction] = React.useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  // State for rejection dialog
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [requestToReject, setRequestToReject] = React.useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  const refreshApprovalData = React.useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const approvalData = await getApprovalRequestsForUser(user.email);
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
    if (user) {
      refreshApprovalData();
    }
  }, [user, authLoading, router, refreshApprovalData]);
  
  const handleApprovalAction = async (requestId: string, newStatus: 'Approved') => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateApprovalRequest(requestId, { status: newStatus, actorEmail: user.email });
      toast({
        title: `Request ${newStatus}`,
        description: `The request has been successfully ${newStatus.toLowerCase()}.`,
      });
      await refreshApprovalData(); // Re-fetch to update list
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast({
        title: "Error",
        description: "Could not update the request status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectDialog = (request: ApprovalRequest) => {
    setRequestToReject(request);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!requestToReject || !user || !rejectionReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a reason for rejection.", variant: "destructive"});
      return;
    };
    setIsSubmitting(true);
    try {
      await updateApprovalRequest(requestToReject.id, { 
        status: "Rejected", 
        actorEmail: user.email, 
        comment: rejectionReason 
      });
      toast({
        title: "Request Rejected",
        description: "The request has been successfully rejected.",
      });
      await refreshApprovalData(); // Re-fetch to update list
      setIsRejectDialogOpen(false);
      setRequestToReject(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Could not reject the request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    <>
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
                <Button variant="outline" size="sm" onClick={() => openRejectDialog(req)} disabled={isSubmitting}>
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button size="sm" onClick={() => handleApprovalAction(req.id, "Approved")} disabled={isSubmitting}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>

    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Reject Request: {requestToReject?.title}</DialogTitle>
                <DialogDescription>
                    Please provide a reason for rejecting this request. This will be visible to the requestor.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="rejection-reason" className="sr-only">Rejection Reason</Label>
                <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide justification for rejection..."
                    rows={4}
                    disabled={isSubmitting}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleRejectSubmit} disabled={isSubmitting || !rejectionReason.trim()}>
                    {isSubmitting ? 'Submitting...' : 'Confirm Rejection'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
