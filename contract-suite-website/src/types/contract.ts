/**
 * Contract Review Type Definitions
 * Matches backend API response schemas
 */

export interface IssueInfo {
  category: string;
  severity: '高' | '中' | '低';
  location_hint: string;
  original_text: string;
  problem: string;
  suggestion: string;
}

export interface ReviewResult {
  issues: IssueInfo[];
  summary: string;
  total_issues: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

export interface Contract {
  id: string;
  title: string;
  original_filename: string;
  status: 'pending' | 'reviewing' | 'completed';
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  id: string;
  contract_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ReviewResult;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  contract_id?: string;
}
