export interface Customer {
  _id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  industry?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  notes?: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: CustomerPagination;
}

export interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  industry: string;
  website: string;
  notes: string;
  assignedTo: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };
}