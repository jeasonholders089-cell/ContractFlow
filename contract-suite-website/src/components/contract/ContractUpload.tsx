/**
 * ContractUpload Component
 * File upload UI with drag & drop support
 */

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContractUploadProps {
  onUpload: (file: File, title: string) => Promise<void>;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function ContractUpload({ onUpload, isUploading }: ContractUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '仅支持 .docx 格式的文件';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '文件大小不能超过 10MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace('.docx', ''));
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile, title);
      setSelectedFile(null);
      setTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('上传失败，请重试');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">上传合同文件</h3>
          <p className="text-sm text-muted-foreground">
            支持 .docx 格式，文件大小不超过 10MB
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <FileText className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                更换文件
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">拖拽文件到此处</p>
                <p className="text-sm text-muted-foreground">或</p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                选择文件
              </Button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="contract-title">合同标题（可选）</Label>
              <Input
                id="contract-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入合同标题"
                disabled={isUploading}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleUploadClick}
              disabled={isUploading || !selectedFile}
              className="w-full"
              size="lg"
            >
              {isUploading ? '上传中...' : '开始上传并审查'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
