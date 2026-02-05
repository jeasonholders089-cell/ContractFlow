/**
 * Contract Service
 * API methods for contract upload, review, and management
 */

import api from './api';
import type {
  Contract,
  ReviewResponse,
  UploadResponse,
} from '@/types/contract';

/**
 * Upload a contract file for review
 * @param file - The .docx file to upload
 * @param title - Optional title for the contract
 * @returns Upload response with contract ID
 */
export const uploadContract = async (
  file: File,
  title?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }

  const response = await api.post<UploadResponse>(
    '/api/reviews/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Start AI review process for a contract
 * @param contractId - The contract ID to review
 * @returns Review response with review ID
 */
export const startReview = async (
  contractId: string
): Promise<ReviewResponse> => {
  const response = await api.post<ReviewResponse>(
    `/api/reviews/${contractId}/start`
  );

  return response.data;
};

/**
 * Get review status and results
 * @param reviewId - The review ID to check
 * @returns Review response with current status and results
 */
export const getReview = async (
  reviewId: string
): Promise<ReviewResponse> => {
  const response = await api.get<ReviewResponse>(`/api/reviews/${reviewId}`);
  return response.data;
};

/**
 * Download reviewed document with AI comments
 * @param reviewId - The review ID
 * @returns Blob of the .docx file
 */
export const downloadReviewedDoc = async (
  reviewId: string
): Promise<Blob> => {
  const response = await api.get(`/api/reviews/${reviewId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Download text review report
 * @param reviewId - The review ID
 * @returns Blob of the text report
 */
export const downloadReport = async (reviewId: string): Promise<Blob> => {
  const response = await api.get(`/api/reviews/${reviewId}/report`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get list of all contracts
 * @returns Array of contracts
 */
export const listContracts = async (): Promise<Contract[]> => {
  const response = await api.get<Contract[]>('/api/reviews/contracts');
  return response.data;
};

/**
 * Get contract details by ID
 * @param contractId - The contract ID
 * @returns Contract details
 */
export const getContract = async (contractId: string): Promise<Contract> => {
  const response = await api.get<Contract>(
    `/api/reviews/contracts/${contractId}`
  );
  return response.data;
};
