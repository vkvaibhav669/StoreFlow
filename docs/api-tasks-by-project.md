# API Integration: Tasks by Project ID

## Overview

This document describes the integration of the new API endpoint for fetching tasks by project ID. The API is designed to work with external backend services running on separate ports/repositories.

## API Endpoint

### GET /api/tasks/:projectId

**Description**: Fetch all tasks for a specific project.

**Parameters**:
- `projectId` (string): The unique identifier of the project

**Response**:
- Success (200): Array of Task objects
- Error (400): Invalid project ID
- Error (404): Project not found
- Error (500): Server error

**Example Request**:
```bash
curl http://localhost:8080/api/tasks/project-1
```

**Example Response**:
```json
[
  {
    "id": "task-1",
    "name": "Property Finalization",
    "department": "Property",
    "status": "In Progress",
    "priority": "High",
    "assignedTo": "property.manager@company.com",
    "assignedToName": "Property Manager",
    "dueDate": "2024-02-15",
    "description": "Finalize property lease agreement"
  }
]
```

## Frontend Integration

### API Function

The frontend provides a convenient function to call this endpoint:

```typescript
import { getTasksByProjectId } from '@/lib/api';

// Usage
const tasks = await getTasksByProjectId('project-1');
```

### Configuration

The API base URL can be configured for external backend services:

```bash
# For external backend running on port 8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# For external backend on different host
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

If not specified, defaults to `http://localhost:8000/api`.

## Backend Compatibility

The API is designed to work with both:
1. **Internal Next.js API routes** (development/testing)
2. **External backend services** (production)

### Internal API Route

The implementation in `/src/app/api/tasks/[projectId]/route.ts` provides:
- MongoDB integration with ObjectId support
- Fallback to mock data for development
- Proper error handling and validation

### External Backend Integration

For production use with external backends:
1. Set `NEXT_PUBLIC_API_URL` environment variable
2. Ensure the external backend implements the same endpoint structure
3. The external backend should handle:
   - GET `/api/tasks/:projectId`
   - Return Task[] or appropriate error responses

## Error Handling

The API includes comprehensive error handling:

```typescript
try {
  const tasks = await getTasksByProjectId(projectId);
  // Handle success
} catch (error) {
  // Handle errors:
  // - Network errors
  // - Invalid project ID
  // - Project not found
  // - Server errors
}
```

## Example Usage

```typescript
import { getTasksByProjectId } from '@/lib/api';

const ProjectTasks = ({ projectId }: { projectId: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const fetchedTasks = await getTasksByProjectId(projectId);
        setTasks(fetchedTasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <span>Status: {task.status}</span>
        </div>
      ))}
    </div>
  );
};
```

## Testing

The API can be tested with:

```bash
# Test with valid project ID
curl http://localhost:8080/api/tasks/project-1

# Test with invalid project ID
curl http://localhost:8080/api/tasks/invalid-project

# Test error response
curl http://localhost:8080/api/tasks/
```

## Benefits

1. **Separation of Concerns**: Tasks can be fetched independently of project data
2. **Performance**: Reduced payload when only tasks are needed
3. **Flexibility**: Works with both internal and external backends
4. **Scalability**: Supports microservice architecture with separate backend services
5. **Compatibility**: Maintains backward compatibility with existing code