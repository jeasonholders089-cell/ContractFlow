/**
 * useContractReview Hook
 * Custom hook for managing contract review workflow
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  uploadContract as uploadContractAPI,
  startReview as startReviewAPI,
  getReview,
} from '@/services/contractService';
import type { ReviewResponse } from '@/types/contract';

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

export function useContractReview() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewResponse | null>(null);
  const [contractTitle, setContractTitle] = useState('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const pollReviewStatus = useCallback(async (reviewId: string) => {
    try {
      const review = await getReview(reviewId);
      setCurrentReview(review);

      if (review.status === 'completed') {
        stopPolling();
        toast.success('合同审查完成！');
      } else if (review.status === 'failed') {
        stopPolling();
        toast.error(review.error_message || '审查失败');
      } else if (Date.now() - pollStartTimeRef.current > MAX_POLL_TIME) {
        stopPolling();
        toast.error('审查超时，请重试');
      }
    } catch (error) {
      console.error('Poll error:', error);
      stopPolling();
      toast.error('获取审查状态失败');
    }
  }, [stopPolling]);

  const startPolling = useCallback((reviewId: string) => {
    stopPolling();
    pollStartTimeRef.current = Date.now();

    pollIntervalRef.current = setInterval(() => {
      pollReviewStatus(reviewId);
    }, POLL_INTERVAL);

    pollReviewStatus(reviewId);
  }, [pollReviewStatus, stopPolling]);

  const uploadContract = useCallback(async (file: File, title: string) => {
    setIsUploading(true);
    setContractTitle(title || file.name.replace('.docx', ''));

    try {
      toast.loading('正在上传合同...', { id: 'upload' });

      const uploadResponse = await uploadContractAPI(file, title);

      if (!uploadResponse.success || !uploadResponse.contract_id) {
        throw new Error(uploadResponse.message || '上传失败');
      }

      toast.success('上传成功，开始审查...', { id: 'upload' });

      const reviewResponse = await startReviewAPI(uploadResponse.contract_id);
      setCurrentReview(reviewResponse);

      startPolling(reviewResponse.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || '上传失败，请重试', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  }, [startPolling]);

  const resetReview = useCallback(() => {
    stopPolling();
    setCurrentReview(null);
    setContractTitle('');
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isUploading,
    currentReview,
    contractTitle,
    uploadContract,
    resetReview,
  };
}