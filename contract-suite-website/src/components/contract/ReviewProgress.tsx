/**
 * ReviewProgress Component
 * Shows review status with progress indicator
 */

import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ReviewProgressProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export function ReviewProgress({ status, errorMessage }: ReviewProgressProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500" />,
          title: '等待审查',
          description: '合同已上传，等待AI审查开始',
          badge: <Badge variant="secondary">等待中</Badge>,
          progress: 25,
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />,
          title: 'AI审查中',
          description: '正在使用AI技术分析合同内容，识别潜在风险',
          badge: <Badge className="bg-blue-500">处理中</Badge>,
          progress: 60,
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
          title: '审查完成',
          description: '合同审查已完成，请查看详细报告',
          badge: <Badge className="bg-green-500">已完成</Badge>,
          progress: 100,
        };
      case 'failed':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          title: '审查失败',
          description: errorMessage || '审查过程中出现错误，请重试',
          badge: <Badge variant="destructive">失败</Badge>,
          progress: 0,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">审查进度</h3>
          {config.badge}
        </div>

        <div className="flex flex-col items-center text-center space-y-3 py-4">
          {config.icon}
          <div>
            <p className="font-medium text-lg">{config.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>

        <Progress value={config.progress} className="h-2" />

        {status === 'processing' && (
          <p className="text-xs text-center text-muted-foreground">
            预计需要 30-60 秒，请耐心等待...
          </p>
        )}
      </div>
    </Card>
  );
}