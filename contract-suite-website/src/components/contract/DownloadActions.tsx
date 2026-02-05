/**
 * DownloadActions Component
 * Download buttons for reviewed document and report
 */

import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { downloadReviewedDoc, downloadReport } from '@/services/contractService';

interface DownloadActionsProps {
  reviewId: string;
  contractTitle: string;
}

export function DownloadActions({ reviewId, contractTitle }: DownloadActionsProps) {
  const handleDownloadDoc = async () => {
    try {
      toast.loading('正在下载审查文档...', { id: 'download-doc' });
      const blob = await downloadReviewedDoc(reviewId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contractTitle}_审查版.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('文档下载成功', { id: 'download-doc' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('下载失败，请重试', { id: 'download-doc' });
    }
  };

  const handleDownloadReport = async () => {
    try {
      toast.loading('正在下载审查报告...', { id: 'download-report' });
      const blob = await downloadReport(reviewId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contractTitle}_审查报告.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('报告下载成功', { id: 'download-report' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('下载失败，请重试', { id: 'download-report' });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">下载审查结果</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleDownloadDoc}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            下载审查文档
          </Button>

          <Button
            onClick={handleDownloadReport}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            下载文本报告
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          审查文档包含AI标注的问题和建议，文本报告包含完整的问题列表
        </p>
      </div>
    </Card>
  );
}