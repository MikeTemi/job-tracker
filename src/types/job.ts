// Job application status enum
export enum JobStatus {
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  REJECTED = 'Rejected',
  OFFER = 'Offer'
}

// Main Job interface
export interface Job {
  id: string;
  title: string;
  company: string;
  applicationLink: string;
  status: JobStatus;
  dateApplied: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Job creation type (excludes auto-generated fields)
export interface CreateJobData {
  title: string;
  company: string;
  applicationLink: string;
  status: JobStatus;
}

// Job update type (all fields optional except id)
export interface UpdateJobData {
  id: string;
  title?: string;
  company?: string;
  applicationLink?: string;
  status?: JobStatus;
}

// AI Analysis interfaces
export interface JobAnalysisRequest {
  jobDescription: string;
}

export interface JobAnalysisResponse {
  summary: string;
  suggestedSkills: string[];
  analysisDate: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter and sort options
export interface JobFilters {
  status?: JobStatus | 'all';
  company?: string;
  searchTerm?: string;
}

export interface JobSortOptions {
  field: 'dateApplied' | 'company' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

// Form validation types
export interface JobFormErrors {
  title?: string;
  company?: string;
  applicationLink?: string;
  status?: string;
}