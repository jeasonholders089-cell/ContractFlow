/**
 * RiskAnalysis Component
 * Displays review results with risk summary and issue list
 */

import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IssueCard } from './IssueCard';
import type { ReviewResult } from '@/types/contract';

interface RiskAnalysisProps {
  result: ReviewResult;
}

export function RiskAnalysis({ result }: RiskAnalysisProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | '高' | '中' | '低'>('all');

  const filteredIssues = filterSeverity === 'all'
    ? result.issues
    : result.issues.filter(issue => issue.severity === filterSeverity);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总问题数</p>
              <p className="text-2xl font-bold mt-1">{result.total_issues}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">高风险</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {result.high_risk_count}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">中风险</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">
                {result.medium_risk_count}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">低风险</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {result.low_risk_count}
              </p>
            </div>
            <Info className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Summary */}
      {result.summary && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">审查总结</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {result.summary}
          </p>
        </Card>
      )}

      {/* Issues List */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">问题详情</h3>
            <Badge variant="secondary">
              {filteredIssues.length} 个问题
            </Badge>
          </div>

          <Tabs value={filterSeverity} onValueChange={(v) => setFilterSeverity(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                全部 ({result.total_issues})
              </TabsTrigger>
              <TabsTrigger value="高">
                高风险 ({result.high_risk_count})
              </TabsTrigger>
              <TabsTrigger value="中">
                中风险 ({result.medium_risk_count})
              </TabsTrigger>
              <TabsTrigger value="低">
                低风险 ({result.low_risk_count})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filterSeverity} className="space-y-4 mt-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, index) => (
                  <IssueCard
                    key={index}
                    issue={issue}
                    index={result.issues.indexOf(issue)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  没有找到该风险等级的问题
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}