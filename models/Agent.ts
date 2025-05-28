import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ✅ MUST be required
  totalSales: { type: Number, default: 0 },
  level: { type: String, enum: ['L1', 'L2'], default: 'L1' },
});

export default mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
