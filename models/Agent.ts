// or update path if different: src\models\Agent.js or src\models\Agent.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password should be at least 6 characters'],
    },
    level: {
      type: String,
      enum: ['L1', 'L2'],
      default: 'L1',
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    agentCommissionPercentage: {
      type: Number,
      // Don't set a default value
      min: 0,
      max: 100,
      required: true // Make it required to prevent undefined values
    },
    organizationCommissionPercentage: {
      type: Number,
      // Don't set a default value  
      min: 0,
      max: 100,
      required: true // Make it required to prevent undefined values
    },
  },
  { timestamps: true }
);

// Don't re-hash the password if it hasn't changed
AgentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// IMPORTANT: Add the password comparison method
AgentSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export interface IAgent extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  level: string;
  totalSales: number;
  agentCommissionPercentage: number;
  organizationCommissionPercentage: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Add null check to handle hot reloading in development
const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;
