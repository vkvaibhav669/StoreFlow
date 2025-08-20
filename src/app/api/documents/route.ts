
import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { DocumentFile, StoreProject } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/documents - Fetches all documents from all projects
export async function GET() {
  try {
    const allDocuments: (DocumentFile & { projectId: string, projectName: string })[] = [];
    
    // In a real app, this would be a MongoDB aggregation query.
    // For mock data, we iterate through projects.
    mockProjects.forEach((project: StoreProject) => {
      if (project.documents && project.documents.length > 0) {
        project.documents.forEach(doc => {
          allDocuments.push({
            ...doc,
            projectId: project.id,
            projectName: project.name,
          });
        });
      }
    });
    
    return NextResponse.json(allDocuments);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Handles file upload and adds document to a project
export async function POST(request: Request) {
  try {
    // In a real app, you would use a library like 'multer' or Next.js API's built-in
    // body parser for multipart/form-data. Here, we simulate the data extraction.
    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as DocumentFile['type'];
    const uploadedBy = formData.get('uploadedBy') as string;
    const hodOnly = formData.get('hodOnly') === 'true';

    if (!projectId || !file || !name || !type || !uploadedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const newDoc: DocumentFile = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      // In a real app, you'd upload to a service like S3/GCS and store the URL.
      url: `/uploads/mock/${file.name}`,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      uploadedById: 'mock-user-id', // In real app, this would be the actual user ID
      hodOnly,
      dataAiHint: formData.get('dataAiHint') as string | undefined,
    };

    if (!project.documents) {
      project.documents = [];
    }
    project.documents.unshift(newDoc);

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
