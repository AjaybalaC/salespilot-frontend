// ── Dashboard Summary ─────────────────────────────────────────────────────────

export interface DashboardSummary {
  leads: {
    total: number;
    newThisMonth: number;
    won: number;
    lost: number;
    conversionRate: number;
    growth: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  followUps: {
    pending: number;
    today: number;
    overdue: number;
  };
  tasks: {
    pending: number;
    today: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    total: number;
    growth: number;
  };
  invoices: {
    pending: number;
    overdue: number;
  };
}

// ── Revenue Analytics ─────────────────────────────────────────────────────────

export interface RevenueAnalytics {
  monthly: {
    month: string;
    revenue: number;
    invoices: number;
  }[];
  byStatus: {
    status: string;
    total: number;
    count: number;
  }[];
}

// ── Lead Analytics ────────────────────────────────────────────────────────────

export interface LeadAnalytics {
  byStatus: {
    status: string;
    count: number;
    totalValue: number;
  }[];
  bySource: {
    source: string;
    count: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
  }[];
  trend: {
    month: string;
    total: number;
    won: number;
  }[];
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

export interface PipelineSummary {
  stages: {
    stage: string;
    count: number;
    value: number;
  }[];
  totalPipelineValue: number;
}

// ── Top Customers ─────────────────────────────────────────────────────────────

export interface TopCustomer {
  _id: string;
  name: string;
  company?: string;
  email: string;
  totalRevenue: number;
  invoiceCount: number;
}

// ── Sales by Employee ─────────────────────────────────────────────────────────

export interface EmployeeSales {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalLeads: number;
  wonLeads: number;
  totalValue: number;
  conversionRate: number;
}

// ── Task Stats ────────────────────────────────────────────────────────────────

export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

// ── Activity ──────────────────────────────────────────────────────────────────

export interface RecentActivity {
  _id: string;
  type: string;
  description: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  lead?: { _id: string; title: string };
  customer?: { _id: string; name: string };
  metadata?: Record<string, any>;
  createdAt: string;
}