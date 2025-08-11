const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Default test users with hashed passwords
const testUsers = [
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'Admin' },
  { name: 'Rohan Mehra', email: 'rohan.mehra@example.com', role: 'Member' },
  { name: 'Parag Shah (SA)', email: 'parag@hk.co', role: 'SuperAdmin' },
  { name: 'Manish Kemani (SA)', email: 'manish@kisna.com', role: 'SuperAdmin' },
  { name: 'Trisha Paul (SA)', email: 'trisha.p@kisna.com', role: 'SuperAdmin' },
  { name: 'Vaibhhav Rajkumar (SA)', email: 'vaibhhavrajkumar@gmail.com', role: 'SuperAdmin' },
];

const DEFAULT_PASSWORD = 'TestAdmin@123';

async function addTestUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('storeflow');
    const usersCollection = db.collection('users');

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ 
        email: userData.email.toLowerCase() 
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const newUser = {
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser);
      console.log(`Created user ${userData.email} with ID: ${result.insertedId}`);
    }

    console.log('Test users setup completed!');
    console.log(`Default password for all test users: ${DEFAULT_PASSWORD}`);

  } catch (error) {
    console.error('Error setting up test users:', error);
  } finally {
    await client.close();
  }
}

// Only run if called directly
if (require.main === module) {
  addTestUsers();
}

module.exports = { addTestUsers };