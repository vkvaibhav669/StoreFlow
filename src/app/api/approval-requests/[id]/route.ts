
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { ApprovalRequest, User, Comment } from '@/types';
import { getAllMockUsers } from '@/lib/auth';

// This is a simplified in-memory store. In a real app, you'd fetch this from data.ts or a database.
let mockApprovalRequests: ApprovalRequest[] = [
    {
        id: 'req-001',
        title: 'Initial Budget for Delhi Store Launch',
        details: 'Requesting approval for the initial budget of INR 50,00,000 for the new store in Delhi.',
        status: 'Pending',
        requestorName: 'Priya Sharma',
        requestorEmail: 'priya.sharma@example.com',
        approverName: 'Vaibhhav Rajkumar (SA)',
        approverEmail: 'vaibhhavrajkumar@gmail.com',
        requestingDepartment: 'Project',
        projectId: 'project-2',
        projectName: 'Delhi Store Launch',
        submissionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: 'req-002',
        title: 'Q3 Marketing Campaign Plan',
        details: 'Approval needed for the upcoming Q3 marketing campaigns across all platforms.',
        status: 'Approved',
        requestorName: 'Rohan Mehra',
        requestorEmail: 'rohan.mehra@example.com',
        approverName: 'Priya Sharma',
        approverEmail: 'priya.sharma@example.com',
        requestingDepartment: 'Marketing',
        submissionDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastUpdateDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        approvalComments: [{
            id: 'comment-ar-001',
            text: 'Looks good. Proceed.',
            author: 'Priya Sharma',
            timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        }]
    },
     {
        id: 'req-003',
        title: 'New IT Vendor Contract',
        details: 'Request to finalize the contract with the new IT hardware vendor.',
        status: 'Rejected',
        requestorName: 'Priya Sharma',
        requestorEmail: 'priya.sharma@example.com',
        approverName: 'Vaibhhav Rajkumar (SA)',
        approverEmail: 'vaibhhavrajkumar@gmail.com',
        requestingDepartment: 'IT',
        submissionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastUpdateDate: new Date(Date.now() - 86400000 * 1).toISOString(),
         approvalComments: [{
            id: 'comment-ar-002',
            text: 'Please get two more quotes before we proceed.',
            author: 'Vaibhhav Rajkumar (SA)',
            timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        }]
    }
];

function getMockCurrentUser(): User | null {
    const headersList = headers();
    const userEmail = headersList.get('x-user-email');
    if (!userEmail) return null;
    const allUsers = getAllMockUsers();
    return allUsers.find(u => u.email === userEmail) || null;
}


// GET /api/approval-requests/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const requestItem = mockApprovalRequests.find(req => req.id === id);

  if (!requestItem) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // In a real app, you'd check if the current user has permission to view this.
  return NextResponse.json(requestItem);
}


// PUT /api/approval-requests/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const currentUser = getMockCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestIndex = mockApprovalRequests.findIndex(req => req.id === id);

  if (requestIndex === -1) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const requestToUpdate = mockApprovalRequests[requestIndex];

  // Authorization: Only the designated approver can approve/reject.
  if (requestToUpdate.approverEmail !== currentUser.email) {
    return NextResponse.json({ error: 'Permission denied. You are not the approver for this request.' }, { status: 403 });
  }
  
  if (requestToUpdate.status !== 'Pending') {
    return NextResponse.json({ error: `Cannot update a request with status "${requestToUpdate.status}".`}, { status: 409 });
  }

  try {
    const body = await request.json();
    const { status, comment } = body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
    }
    
    if (status === 'Rejected' && !comment) {
        return NextResponse.json({ error: 'A comment is required when rejecting a request.' }, { status: 400 });
    }

    requestToUpdate.status = status;
    requestToUpdate.lastUpdateDate = new Date().toISOString();
    
    if (comment) {
        const newComment: Comment = {
            id: `comment-ar-${Date.now()}`,
            text: comment,
            author: currentUser.name,
            authorId: currentUser.id,
            timestamp: new Date().toISOString()
        };
        if (!requestToUpdate.approvalComments) {
            requestToUpdate.approvalComments = [];
        }
        requestToUpdate.approvalComments.push(newComment);
    }
    
    mockApprovalRequests[requestIndex] = requestToUpdate;

    return NextResponse.json(requestToUpdate);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
