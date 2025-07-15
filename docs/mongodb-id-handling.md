# MongoDB ID Handling in StoreFlow

## Problem Statement
The application was experiencing "undefined" in dynamic URLs when fetching project and store information. This was due to a mismatch between MongoDB's ObjectId format and the frontend's ID handling.

## Solution Implemented

### 1. MongoDB Connection Setup
- Implemented proper MongoDB connection in `src/lib/mongodb.ts`
- Added utility functions for ObjectId validation and transformation
- Graceful fallback to mock data if MongoDB is unavailable

### 2. API Route Updates
- Updated `/api/projects/[id]/route.ts` and `/api/store/[id]/route.ts`
- Added ObjectId validation before querying MongoDB
- Fall back to mock data for development/testing

### 3. Frontend Validation
- Enhanced ID validation in frontend pages
- Support for both ObjectId format (24-character hex) and simple strings
- Proper error handling for invalid ID formats

### 4. Document Transformation
- Automatic conversion of MongoDB's `_id` field to `id` field
- Ensures frontend receives consistent data structure

## ID Format Support

### MongoDB ObjectId Format
- 24-character hexadecimal string
- Example: `507f1f77bcf86cd799439011`
- Used when data comes from MongoDB

### Simple String Format (Fallback)
- Alphanumeric with hyphens/underscores
- Example: `project-1`, `store-2`
- Used for mock data during development

## Usage Examples

### API Routes
```typescript
// MongoDB query with ObjectId
if (isValidObjectId(id)) {
  const project = await collection.findOne({ _id: toObjectId(id) });
  return NextResponse.json(transformMongoDocument(project));
}

// Fallback to mock data
const project = mockProjects.find(p => p.id === id);
```

### Frontend Validation
```typescript
const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
const isSimpleString = /^[a-zA-Z0-9-_]+$/.test(id);
if (isObjectId || isSimpleString) {
  // Valid ID format
}
```

## Benefits
1. **Seamless MongoDB Integration**: Proper ObjectId handling
2. **Backward Compatibility**: Still works with mock data
3. **Error Prevention**: No more "undefined" in URLs
4. **Type Safety**: Proper validation at API boundaries
5. **Graceful Degradation**: Falls back if MongoDB unavailable