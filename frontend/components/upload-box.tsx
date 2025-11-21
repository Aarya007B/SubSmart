'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadBoxProps {
    onUpload: (file: File) => Promise<void>;
    accept?: string;
}

export default function UploadBox({ onUpload, accept = '.csv' }: UploadBoxProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setUploadStatus('idle');
            setErrorMessage('');
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus('idle');
            setErrorMessage('');
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('idle');
        setErrorMessage('');

        try {
            await onUpload(file);
            setUploadStatus('success');
            setTimeout(() => {
                setFile(null);
                setUploadStatus('idle');
            }, 3000);
        } catch (error: any) {
            setUploadStatus('error');
            setErrorMessage(error.response?.data?.detail || error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
                    isDragOver
                        ? 'border-primary bg-primary/5 scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-accent/30',
                    file && 'bg-accent/20'
                )}
            >
                {/* Animated background gradient */}
                <div className={cn(
                    'absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 opacity-0 transition-opacity duration-500',
                    isDragOver && 'opacity-100 animate-gradient'
                )} />

                <div className="relative p-12">
                    <input
                        type="file"
                        id="file-upload"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!file ? (
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center cursor-pointer space-y-4"
                        >
                            <div className="relative">
                                <Upload className={cn(
                                    'h-16 w-16 transition-all duration-300',
                                    isDragOver ? 'text-primary scale-110' : 'text-muted-foreground'
                                )} />
                                <div className={cn(
                                    'absolute inset-0 bg-primary/20 blur-2xl transition-opacity duration-300',
                                    isDragOver ? 'opacity-75' : 'opacity-0'
                                )} />
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-foreground">
                                    {isDragOver ? 'Drop your CSV file here' : 'Upload your transaction data'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Drag and drop or <span className="text-primary font-medium">click to browse</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Accepts CSV files only
                                </p>
                            </div>
                        </label>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50 border border-border">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="font-medium text-foreground">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>

                                {uploadStatus === 'success' && (
                                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 animate-fade-in" />
                                )}
                                {uploadStatus === 'error' && (
                                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 animate-fade-in" />
                                )}
                            </div>

                            {uploadStatus === 'error' && errorMessage && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                                </div>
                            )}

                            {uploadStatus === 'success' && (
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        ✓ File uploaded successfully!
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setUploadStatus('idle');
                                        setErrorMessage('');
                                    }}
                                    disabled={isUploading}
                                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading || uploadStatus === 'success'}
                                    className={cn(
                                        'flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105',
                                        'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground',
                                        'hover:shadow-lg hover:shadow-primary/25',
                                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
                                        'flex items-center justify-center gap-2'
                                    )}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : uploadStatus === 'success' ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Uploaded
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Upload File
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
