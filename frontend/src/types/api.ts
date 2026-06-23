export type ProjectStatus =
  | "pending"
  | "crawling"
  | "analyzing"
  | "completed"
  | "failed";

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  is_active?: boolean;
  selected_plan?: string | null;
  trial_ends_at?: string | null;
  access_approved_at?: string | null;
  access_status?: "admin" | "approved" | "trial" | "pending_approval" | "disabled";
  payment_phone?: string;
  payment_methods?: string;
  invoice_channel?: string;
  requires_admin_approval?: boolean;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface AccountOverview {
  account: {
    id: number;
    name: string;
    email: string;
    selected_plan?: string | null;
    access_status?: string | null;
    trial_ends_at?: string | null;
    oauth_provider?: string | null;
    created_at?: string | null;
  };
  usage: {
    period: { label: string; starts_at: string; ends_at: string };
    tokens: {
      used_this_month: number;
      monthly_limit: number;
      unlimited: boolean;
      remaining: number | null;
      percent_used: number;
    };
    tokens_by_action: Record<string, number>;
    activity_counts: Record<string, number>;
    estimate_tokens_per_analysis: number;
  };
  data_stored: {
    projects: number;
    crawled_pages: number;
    generated_contents: number;
    usage_log_entries: number;
  };
}

export interface UsageLogRow {
  id: number;
  action: string;
  project_id: number | null;
  project_name?: string | null;
  total_tokens: number;
  provider?: string | null;
  model?: string | null;
  meta?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active?: boolean;
  selected_plan?: string | null;
  trial_ends_at?: string | null;
  access_approved_at?: string | null;
  access_status?: "admin" | "approved" | "trial" | "pending_approval" | "disabled";
  created_at: string | null;
}

export interface CrawledPageImage {
  url: string;
  alt?: string | null;
  kind: string;
}

export interface CrawledPage {
  id: number;
  url: string;
  page_type: string;
  title: string | null;
  render_method: string;
  extracted_text_preview: string;
  images: CrawledPageImage[];
  created_at: string | null;
}

export interface AiAnalysis {
  business_summary: string | null;
  target_audience: string | null;
  brand_tone: string | null;
  unique_selling_points: string[];
  marketing_angles: string[];
  content_pillars: string[];
  updated_at: string | null;
}

export interface GeneratedContent {
  id: number;
  content_type: string;
  title: string | null;
  content: string;
  meta: Record<string, unknown> | null;
  created_at: string | null;
}

export interface Project {
  id: number;
  name: string;
  user?: { id: number; name: string; email: string } | null;
  website_url: string;
  content_language?: "en" | "ar";
  store_platform?: "shopify" | "woocommerce" | "custom" | null;
  store_url?: string | null;
  has_store_config?: boolean;
  ai_provider?: "openai" | "gemini" | null;
  has_ai_config?: boolean;
  has_stored_ai_key?: boolean;
  status: ProjectStatus;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  crawled_pages?: CrawledPage[];
  ai_analysis?: AiAnalysis | null;
  generated_contents?: GeneratedContent[];
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface StoreAnalyticsBestProduct {
  product_id: string | null;
  product_name: string;
  revenue: number;
  quantity: number;
  order_count: number;
}

export interface StoreAnalyticsBestCustomer {
  customer_email: string;
  spend: number;
  order_count: number;
  first_order_date: string | null;
  last_order_date: string | null;
}

export interface StoreAnalyticsTotals {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
}

export interface StoreAnalyticsStats {
  totals: StoreAnalyticsTotals;
  best_products: StoreAnalyticsBestProduct[];
  best_customers: StoreAnalyticsBestCustomer[];
  revenue_by_day: Array<{ date: string; revenue: number }>;
}

export interface StoreAnalyticsResponse {
  module_name: string;
  platform: string;
  stats: StoreAnalyticsStats;
  meta?: {
    language?: "en" | "ar";
    [key: string]: unknown;
  };
  ai_discussion?: {
    executive_summary: string;
    focus_items: string[];
    marketing_ideas: string[];
    risks: string[];
    next_30_day_plan: string[];
  } | null;
}
