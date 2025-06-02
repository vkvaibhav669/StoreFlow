
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { mockProjects, addApprovalRequest, mockHeadOfficeContacts } from "@/lib/data";
import type { Department, ApprovalRequest } from "@/types";
import { Package2 } from "lucide-react";

const allPossibleDepartments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT"];

export default function ApprovalPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [requestTitle, setRequestTitle] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(undefined);
  const [requestingDepartment, setRequestingDepartment] = React.useState<Department | "">("");
  const [details, setDetails] = React.useState("");
  const [approverName, setApproverName] = React.useState("");
  const [approverEmail, setApproverEmail] = React.useState(""); // For system use
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

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
        setApproverEmail(`${requestingDepartment.toLowerCase()}.hod@storeflow.corp`); // Placeholder
      }
    } else {
      setApproverName("");
      setApproverEmail("");
    }
  }, [requestingDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      projectId: selectedProjectId === "N/A" ? undefined : selectedProjectId,
      projectName: selectedProject?.name,
      requestingDepartment: requestingDepartment as Department,
      requestorName: user.name || user.email,
      requestorEmail: user.email,
      details: details,
      approverName: approverName,
      approverEmail: approverEmail, // Use the derived/set email
    };

    addApprovalRequest(newRequestData);

    toast({
      title: "Approval Request Submitted",
      description: `Your request "${requestTitle}" has been sent to ${approverName}.`,
    });

    setRequestTitle("");
    setSelectedProjectId(undefined);
    setRequestingDepartment("");
    setDetails("");
    // Approver name and email will reset via useEffect on department change or if department is cleared
    setIsSubmitting(false);
  };


  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading..." : "Please sign in."}</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 items-center" aria-labelledby="approval-page-heading">
      <h1 id="approval-page-heading" className="text-2xl font-semibold md:text-3xl mt-4">Submit Approval Request</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>Fill out the form below to submit your request for approval.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="requestTitle">Request Title / Subject *</Label>
              <Input
                id="requestTitle"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="e.g., Budget increase for Q3 marketing"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Associated Project (Optional)</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project">
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
              <Label htmlFor="requestingDepartment">Requesting Department *</Label>
              <Select value={requestingDepartment} onValueChange={(value) => setRequestingDepartment(value as Department | "")} required>
                <SelectTrigger id="requestingDepartment">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {allPossibleDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details / Justification *</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide a detailed explanation for your request..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">Approver *</Label>
              <Input
                id="approver"
                value={approverName}
                onChange={(e) => {
                  setApproverName(e.target.value);
                  // If manually changed, we might lose the email or need to re-derive.
                  // For simplicity, if they edit name, email might become generic.
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
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
}
