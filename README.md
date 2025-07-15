# StoreFlow

StoreFlow is a comprehensive project and store management application built with Next.js, designed to handle the complete lifecycle of store launches and operations.

## Features

- **Project Management**: Track store launch projects from planning to completion
- **Store Operations**: Manage operational stores with tasks and improvement tracking
- **MongoDB Integration**: Seamless support for MongoDB with proper ObjectId handling
- **User Management**: Role-based access control (Member, Admin, SuperAdmin)
- **Task Tracking**: Comprehensive task management across departments
- **Document Management**: File uploads and document sharing
- **Real-time Comments**: Discussion threads on projects and improvement points

## Recent Updates

### MongoDB ID Handling Fix
Fixed the issue where dynamic URLs were getting "undefined" when fetching from MongoDB backend. The solution includes:

- Proper MongoDB ObjectId validation and conversion
- Backward compatibility with mock data
- Enhanced ID validation on both frontend and backend
- Graceful error handling and fallback mechanisms

See [docs/mongodb-id-handling.md](docs/mongodb-id-handling.md) for detailed information.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StoreFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your MongoDB connection string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:8080](http://localhost:8080)

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- Other environment variables as needed

## Testing

Run the MongoDB integration tests:

```bash
# Test ID validation
node tests/mongodb/test-id-validation.js

# Test API logic
node tests/mongodb/test-api-logic.js

# Run demo
node tests/mongodb/mongodb-demo.js
```

## API Routes

- `/api/projects` - Project management endpoints
- `/api/store` - Store management endpoints  
- `/api/tasks` - Task management endpoints

Each endpoint supports both MongoDB ObjectIds and simple string IDs for backward compatibility.

## Architecture

- **Frontend**: Next.js with TypeScript
- **Database**: MongoDB with ObjectId support
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Firebase Auth integration
- **State Management**: React hooks and context

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
