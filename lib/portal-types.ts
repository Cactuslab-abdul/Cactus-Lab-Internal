export type ContentStatus =
  | "idea_pending"
  | "idea_approved"
  | "idea_revision"
  | "in_production"
  | "ready_for_review"
  | "client_approved"
  | "posted";

export type ContentType = "Reel" | "Story" | "Post" | "TikTok" | "LinkedIn";

export interface ContentItem {
  id: string;
  month: string;
  number: number;
  title: string;
  type: ContentType;
  ideaDescription: string;
  status: ContentStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  postedUrl?: string;
  caption?: string;
  clientNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsWeek {
  id: string;
  weekDate: string;
  instagram: {
    followers: number;
    followersChange: number;
    views: number;
    reach: number;
    engagementRate: number;
    topPostUrl?: string;
  };
  tiktok?: {
    followers: number;
    followersChange: number;
    views: number;
  };
  notes?: string;
  enteredAt: string;
}

export interface PortalInvoice {
  id: string;
  number: string;
  month: string;
  date: string;
  dueDate: string;
  amountAED: number;
  vatAED: number;
  totalAED: number;
  status: "paid" | "pending" | "overdue";
  pdfUrl?: string;
  paidDate?: string;
}

export interface PortalPackage {
  name: string;
  services: string[];
  retainerAED: number;
  startDate: string;
  contractMonths?: number;
  primaryContactName?: string;
  primaryContactWhatsApp?: string;
  primaryContactEmail?: string;
}

export interface PortalData {
  clientId: string;
  clientName: string;
  logoUrl: string;
  agencyWhatsApp: string;
  monthlyVideoQuota: number;
  package: PortalPackage;
  contentItems: ContentItem[];
  analytics: AnalyticsWeek[];
  invoices: PortalInvoice[];
  updatedAt: string;
}
