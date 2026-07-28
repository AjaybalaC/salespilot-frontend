export type LeadStatus =
  | "new"
  | "contacted"
  | "meeting_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

export type LeadPriority = "low" | "medium" | "high";
export type LeadSource =
  | "website"
  | "referral"
  | "social_media"
  | "email"
  | "cold_call"
  | "other";

export interface Lead {
  _id: string;
  title: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  source: LeadSource;
  priority: LeadPriority;
  status: LeadStatus;
  budget?: number;
  expectedDealValue?: number;
  expectedCloseDate?: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  description?: string;
  nextFollowUpDate?: string;
  aiScore?: number;
  aiScoreReason?: string;
  lostReason?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadListResponse {
  leads: Lead[];
  pagination: LeadPagination;
}

export interface PipelineData {
  new: Lead[];
  contacted: Lead[];
  meeting_scheduled: Lead[];
  proposal_sent: Lead[];
  negotiation: Lead[];
  won: Lead[];
  lost: Lead[];
}

export interface LeadFormData {
  title: string;
  customer: string;
  source: LeadSource | "";
  priority: LeadPriority | "";
  status: LeadStatus | "";
  budget: string;
  expectedDealValue: string;
  expectedCloseDate: string;
  assignedTo: string;
  description: string;
  nextFollowUpDate: string;
  lostReason: string;
  tags: string;
}

export interface Activity {
  _id: string;
  type: string;
  description: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
}