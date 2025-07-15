
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI; // Your MongoDB connection string from .env.local or environment variables
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri!, options);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri!, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Utility functions for handling MongoDB ObjectIds
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export function toObjectId(id: string): ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new ObjectId(id);
}

// Transform MongoDB document to match frontend expectations
export function transformMongoDocument(doc: any): any {
  if (!doc) return null;
  
  // Convert _id to id and remove _id
  const transformed = {
    ...doc,
    id: doc._id.toString(),
  };
  delete transformed._id;
  
  return transformed;
}

// Transform array of MongoDB documents
export function transformMongoDocuments(docs: any[]): any[] {
  return docs.map(transformMongoDocument);
}
    