import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env.local file");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongooseInstance) => mongooseInstance.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

import Agent from '../models/Agent';

async function checkSchema() {
  await dbConnect();
  
  // Create a test agent with commission fields
  const testAgent = new Agent({
    name: 'Test Agent Schema',
    email: 'schema-test@example.com',
    password: 'password123',
    level: 'L1',
    totalSales: 100,
    agentCommissionPercentage: 70,
    organizationCommissionPercentage: 30
  });
  
  // Validate the agent
  try {
    await testAgent.validate();
    console.log('Schema validation passed!');
    console.log('Agent fields:', Object.keys(testAgent._doc).filter(k => !k.startsWith('_')));
    
    // Don't save, just check if the fields exist in the document
    if ('agentCommissionPercentage' in testAgent._doc && 'organizationCommissionPercentage' in testAgent._doc) {
      console.log('Commission fields exist in the document!');
      console.log('Agent commission:', testAgent.agentCommissionPercentage);
      console.log('Org commission:', testAgent.organizationCommissionPercentage);
    } else {
      console.error('Commission fields are missing from the document!');
    }
  } catch (error) {
    console.error('Schema validation failed:', error);
  }
}

checkSchema();