import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { ApprovalRequest, User } from '@/types';
import { getAllMockUsers } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// In-memory mock database for approval requests
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

// GET /api/approval-requests
// Fetches requests for the current user (both submitted by them and awaiting their approval)
export async function GET() {
  const currentUser = getMockCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const awaitingMyApproval = mockApprovalRequests.filter(req => 
    req.approverEmail === currentUser.email && req.status === 'Pending'
  ).sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

  const submittedByMe = mockApprovalRequests.filter(req => 
    req.requestorEmail === currentUser.email
  ).sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

  return NextResponse.json({
    awaiting: awaitingMyApproval,
    submitted: submittedByMe
  });
}

// POST /api/approval-requests
// Creates a new approval request
export async function POST(request: Request) {
  const currentUser = getMockCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, details, approverEmail, approverName, projectId, projectName, requestingDepartment, requesterId } = body;

    if (!title || !details || !approverEmail || !approverName || !requestingDepartment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRequest: any = {
      title,
      details,
      status: 'Pending',
      requestorName: currentUser.name,
      requestorEmail: currentUser.email,
      approverEmail,
      approverName,
      projectId,
      projectName,
      requestingDepartment,
      submissionDate: new Date().toISOString(),
      approvalComments: [],
    };

    // if requesterId provided, store as ObjectId reference
    if (requesterId && ObjectId.isValid(requesterId)) {
      newRequest.requester = new ObjectId(requesterId);
    } else if (requesterId) {
      // fallback: keep string
      newRequest.requester = requesterId;
    }

    mockApprovalRequests.unshift(newRequest);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 });
  }
}
