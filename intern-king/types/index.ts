// ===== API Response Types =====

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ===== Domain Types =====

export interface CompanyItem {
  id: string;
  name: string;
  abbr: string;
  categories: string[];
  locations: string[];
  types: string[];
  careerUrl: string;
  isFavorited: boolean;
}

export interface CompanyFilters {
  search?: string;
  location?: string;
  category?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface ResumeItem {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  score: number | null;
  company: string;
  position: string;
  resumeFileName: string;
  createdAt: string;
}

export interface ReviewResult {
  score: number;
  summary: string;
  roasts: Array<{
    point: string;
    detail: string;
    severity: "critical" | "warning" | "info";
  }>;
  suggestions: Array<{
    title: string;
    detail: string;
  }>;
  interviewQuestions: string[];
  sourcesUsed: string;
}

export interface ReviewDetail {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  score: number | null;
  content: ReviewResult | null;
  errorMessage: string | null;
  createdAt: string;
  company: string;
  position: string;
  resume: { fileName: string };
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  stats: {
    resumeCount: number;
    reviewCount: number;
    favoriteCount: number;
  };
}

// ===== Filter Types =====

