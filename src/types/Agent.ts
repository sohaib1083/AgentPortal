export interface AgentType {
  _id: string;
  name: string;
  email: string;
  password?: string;
  level: string;
  totalSales: number;
  agentCommissionPercentage: number; // New field
  organizationCommissionPercentage: number; // New field
  createdAt?: string;
  updatedAt?: string;
}
