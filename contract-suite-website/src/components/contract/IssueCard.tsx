/**
 * IssueCard Component
 * Displays individual contract issue with details
 */

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { IssueInfo } from '@/types/contract';

interface IssueCardProps {
  issue: IssueInfo;
  index: number;
}

export function IssueCard({ issue, index }: IssueCardProps) {
  const getSeverityConfig = (severity: '高' | '中' | '低') => {
    switch (severity) {
      case '高':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          badgeClass: 'bg-red-500 hover:bg-red-600',
          borderClass: 'border-l-red-500',
        };
      case '中':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          badgeClass: 'bg-yellow-500 hover:bg-yellow-600',
          borderClass: 'border-l-yellow-500',
        };
      case '低':
        return {
          icon: <Info className="h-4 w-4" />,
          badgeClass: 'bg-blue-500 hover:bg-blue-600',
          borderClass: 'border-l-blue-500',
        };
    }
  };

  const config = getSeverityConfig(issue.severity);

  return (
    <Card className={`p-4 border-l-4 ${config.borderClass}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">
              #{index + 1}
            </span>
            <Badge variant="secondary" className="text-xs">
              {issue.category}
            </Badge>
          </div>
          <Badge className={`${config.badgeClass} flex items-center gap-1`}>
            {config.icon}
            {issue.severity}风险
          </Badge>
        </div>

        {issue.location_hint && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">位置：</span>
            {issue.location_hint}
          </div>
        )}

        {issue.original_text && (
          <div>
            <p className="text-sm font-medium mb-1">原文：</p>
            <p className="text-sm bg-muted p-2 rounded italic">
              "{issue.original_text}"
            </p>
          </div>
        )}

        <Separator />

        <div>
          <p className="text-sm font-medium mb-1 text-red-600">问题：</p>
          <p className="text-sm">{issue.problem}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-1 text-green-600">建议：</p>
          <p className="text-sm">{issue.suggestion}</p>
        </div>
      </div>
    </Card>
  );
}