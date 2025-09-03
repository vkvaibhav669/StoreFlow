
"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { DocumentFile, StoreProject } from "@/types";
import { format } from "date-fns";
import { Package2, FileText, Download, Eye, UploadCloud, PlusCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock API functions for this new page
async function getAllDocuments(): Promise<(DocumentFile & { projectId: string, projectName: string })[]> {
    const res = await fetch('/api/documents', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
}

async function getAllProjectsForUpload(): Promise<StoreProject[]> {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
}

async function uploadDocument(formData: FormData): Promise<DocumentFile> {
    const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to upload document');
    }
    return res.json();
}


export default function AllDocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [documents, setDocuments] = React.useState<(DocumentFile & { projectId: string, projectName: string })[]>([]);
  const [projects, setProjects] = React.useState<StoreProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState({
    file: null as File | null,
    projectId: "",
    documentName: "",
    documentType: "" as DocumentFile['type'] | "",
    hodOnly: false,
    dataAiHint: ""
  });

  const canUpload = user?.role === "Admin" || user?.role === "SuperAdmin";

  const fetchPageData = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [docs, projs] = await Promise.all([
        getAllDocuments(),
        canUpload ? getAllProjectsForUpload() : Promise.resolve([])
      ]);
      setDocuments(docs);
      setProjects(projs);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load documents.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast, canUpload]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    } else if (user) {
      fetchPageData();
    }
  }, [user, authLoading, router, fetchPageData]);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file, documentName: file.name }));
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      file: null, projectId: "", documentName: "",
      documentType: "", hodOnly: false, dataAiHint: ""
    });
  };

  const handleUploadSubmit = async () => {
    if (!uploadForm.file || !uploadForm.projectId || !uploadForm.documentName || !uploadForm.documentType || !user) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('projectId', uploadForm.projectId);
    formData.append('name', uploadForm.documentName);
    formData.append('type', uploadForm.documentType);
    formData.append('uploadedBy', user.name || user.email || "System");
    formData.append('hodOnly', String(uploadForm.hodOnly));
    if (uploadForm.documentType === '3D Render') {
        formData.append('dataAiHint', uploadForm.dataAiHint);
    }

    try {
      await uploadDocument(formData);
      toast({ title: "Upload Successful", description: `Document "${uploadForm.documentName}" has been uploaded.` });
      await fetchPageData(); // Refresh the list
      setIsUploadDialogOpen(false);
      resetUploadForm();
    } catch (error) {
      toast({ title: "Upload Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  const visibleDocuments = documents.filter(doc => 
    canUpload || !doc.hodOnly
  );

  return (
    <section className="documents-content flex flex-col gap-6" aria-labelledby="documents-heading">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 id="documents-heading" className="text-2xl font-semibold md:text-3xl">All Documents</h1>
        {canUpload && (
            <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => {
                setIsUploadDialogOpen(isOpen);
                if (!isOpen) resetUploadForm();
            }}>
                <DialogTrigger asChild>
                    <Button size="sm" disabled={isUploading}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload New Document</DialogTitle>
                        <DialogDescription>Select a project and file to upload.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project *</Label>
                            <Select value={uploadForm.projectId} onValueChange={(val) => setUploadForm(p => ({...p, projectId: val}))} disabled={isUploading}>
                                <SelectTrigger id="project"><SelectValue placeholder="Select a project" /></SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">File *</Label>
                            <Input id="file" type="file" onChange={handleFileSelected} disabled={isUploading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="docName">Document Name *</Label>
                            <Input id="docName" value={uploadForm.documentName} onChange={(e) => setUploadForm(p => ({...p, documentName: e.target.value}))} disabled={isUploading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="docType">Document Type *</Label>
                            <Select value={uploadForm.documentType} onValueChange={(val) => setUploadForm(p => ({...p, documentType: val as any}))} disabled={isUploading}>
                                <SelectTrigger id="docType"><SelectValue placeholder="Select document type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3D Render">3D Render</SelectItem>
                                    <SelectItem value="Property Document">Property Document</SelectItem>
                                    <SelectItem value="Marketing Collateral">Marketing Collateral</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {uploadForm.documentType === '3D Render' && (
                            <div className="space-y-2">
                                <Label htmlFor="aiHint">AI Hint (for 3D Render)</Label>
                                <Input id="aiHint" value={uploadForm.dataAiHint} onChange={(e) => setUploadForm(p => ({...p, dataAiHint: e.target.value}))} placeholder="e.g., modern storefront" disabled={isUploading} />
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="hodOnly" checked={uploadForm.hodOnly} onCheckedChange={(checked) => setUploadForm(p => ({...p, hodOnly: !!checked}))} disabled={isUploading}/>
                            <Label htmlFor="hodOnly" className="text-sm font-normal">Share with HOD only</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline" disabled={isUploading}>Cancel</Button></DialogClose>
                        <Button onClick={handleUploadSubmit} disabled={!uploadForm.file || isUploading}>
                            {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>A centralized list of all documents across all projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead className="hidden sm:table-cell">Project</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleDocuments.length > 0 ? (
                visibleDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium flex items-center">{doc.name}
                        {doc.hodOnly && <ShieldCheck className="ml-2 h-4 w-4 text-primary shrink-0" title="HOD Only" />}
                      </div>
                      <div className="text-sm text-muted-foreground">{doc.size}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Button variant="link" asChild className="p-0 h-auto">
                            <Link href={`/projects/${doc.projectId}`}>{doc.projectName}</Link>
                        </Button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{doc.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {doc.uploadedAt ? format(new Date(doc.uploadedAt), "PPP") : "N/A"}
                      <div className="text-sm text-muted-foreground">by {doc.uploadedBy}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" /> Download
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
