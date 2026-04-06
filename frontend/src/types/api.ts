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
}

export interface AuthResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
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
