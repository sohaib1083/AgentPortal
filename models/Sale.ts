import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    agentName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    date: {
      type: Date,
      required: false,
      default: Date.now,
    },
    notes: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
      default: function(this: any) {
        return this.productName || '';
      },
    },
    agentCommissionPercentage: {
      type: Number,
      required: true,
    },
    agentCommissionAmount: {
      type: Number,
      required: true,
    },
    organizationCommissionPercentage: {
      type: Number,
      required: true,
    },
    organizationCommissionAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export interface ISale extends mongoose.Document {
  agentId: mongoose.Types.ObjectId;
  agentName: string;
  customerName: string;
  productName: string;
  amount: number;
  date?: Date;
  saleDate: Date;
  notes?: string;
  description?: string;
  agentCommissionPercentage: number;
  agentCommissionAmount: number;
  organizationCommissionPercentage: number;
  organizationCommissionAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Handle hot reloading in development
const Sale = mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;