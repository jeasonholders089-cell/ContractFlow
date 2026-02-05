/**
 * ContractReview Page
 * Main page for contract review feature
 */

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { ContractUpload } from '@/components/contract/ContractUpload';
import { ReviewProgress } from '@/components/contract/ReviewProgress';
import { RiskAnalysis } from '@/components/contract/RiskAnalysis';
import { DownloadActions } from '@/components/contract/DownloadActions';
import { useContractReview } from '@/hooks/useContractReview';

export default function ContractReview() {
  const [, setLocation] = useLocation();
  const {
    isUploading,
    currentReview,
    contractTitle,
    uploadContract,
    resetReview,
  } = useContractReview();

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleNewReview = () => {
    resetReview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">AI 合同审查</h1>
            </div>

            {currentReview && currentReview.status === 'completed' && (
              <Button onClick={handleNewReview} variant="outline">
                开始新的审查
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {!currentReview ? (
            /* Upload Section */
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">上传合同进行AI审查</h2>
                <p className="text-muted-foreground">
                  我们的AI将分析合同内容，识别潜在风险并提供专业建议
                </p>
              </div>
              <ContractUpload
                onUpload={uploadContract}
                isUploading={isUploading}
              />
            </div>
          ) : (
            /* Review Section */
            <div className="space-y-6">
              {/* Contract Title */}
              <div className="text-center">
                <h2 className="text-2xl font-bold">{contractTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  审查ID: {currentReview.id}
                </p>
              </div>

              {/* Progress */}
              <ReviewProgress
                status={currentReview.status}
                errorMessage={currentReview.error_message}
              />

              {/* Results */}
              {currentReview.status === 'completed' && currentReview.result && (
                <>
                  <RiskAnalysis result={currentReview.result} />
                  <DownloadActions
                    reviewId={currentReview.id}
                    contractTitle={contractTitle}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}