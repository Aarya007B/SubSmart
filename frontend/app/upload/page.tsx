'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox from '@/components/upload-box';
import { uploadCSV, detectSubscriptions } from '@/lib/api';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
    const router = useRouter();
    const [step, setStep] = useState<'upload' | 'detecting' | 'complete'>('upload');
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [detectResult, setDetectResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const handleUpload = async (file: File) => {
        try {
            setError('');

            // Step 1: Upload CSV
            const result = await uploadCSV(file);
            setUploadResult(result);

            // Step 2: Detect subscriptions
            setStep('detecting');
            const detected = await detectSubscriptions();
            setDetectResult(detected);

            setStep('complete');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'An error occurred');
            throw err;
        }
    };

    const handleViewDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                            Upload Transaction Data
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Upload your bank transaction CSV file and we'll automatically detect your recurring subscriptions
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 py-8">
                        <StepIndicator
                            number={1}
                            label="Upload CSV"
                            isActive={step === 'upload'}
                            isComplete={step !== 'upload'}
                        />
                        <div className="h-0.5 w-16 bg-border" />
                        <StepIndicator
                            number={2}
                            label="Detect Subscriptions"
                            isActive={step === 'detecting'}
                            isComplete={step === 'complete'}
                        />
                        <div className="h-0.5 w-16 bg-border" />
                        <StepIndicator
                            number={3}
                            label="Complete"
                            isActive={step === 'complete'}
                            isComplete={false}
                        />
                    </div>

                    {/* Upload Section */}
                    {step === 'upload' && (
                        <div className="animate-fade-in">
                            <UploadBox onUpload={handleUpload} />

                            {error && (
                                <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-600 dark:text-red-400">Upload Failed</p>
                                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* CSV Format Instructions */}
                            <div className="mt-8 p-6 rounded-xl border border-border bg-card/50">
                                <h3 className="font-semibold text-foreground mb-3">Expected CSV Format</h3>
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <p>Your CSV file should contain the following columns:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li><span className="font-medium text-foreground">date</span> - Transaction date (YYYY-MM-DD)</li>
                                        <li><span className="font-medium text-foreground">description</span> - Transaction description/merchant</li>
                                        <li><span className="font-medium text-foreground">amount</span> - Transaction amount (numeric)</li>
                                    </ul>
                                    <p className="pt-2 text-xs">Example: <code className="px-2 py-1 bg-muted rounded">2024-01-15,Netflix Subscription,15.99</code></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detecting Section */}
                    {step === 'detecting' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fade-in">
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-semibold text-foreground">Analyzing your transactions...</h3>
                                <p className="text-muted-foreground">This may take a few moments</p>
                            </div>
                            {uploadResult && (
                                <div className="text-sm text-muted-foreground">
                                    Processing {uploadResult.transaction_count} transactions
                                </div>
                            )}
                        </div>
                    )}

                    {/* Complete Section */}
                    {step === 'complete' && detectResult && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                                <div className="relative">
                                    <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-400" />
                                    <div className="absolute inset-0 bg-green-500/20 blur-2xl" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-foreground">Upload Complete!</h3>
                                    <p className="text-lg text-muted-foreground">
                                        Successfully processed your transaction data
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <StatCard
                                    label="Transactions"
                                    value={uploadResult?.transaction_count || 0}
                                    gradient="from-blue-500 to-cyan-500"
                                />
                                <StatCard
                                    label="Subscriptions Detected"
                                    value={detectResult.detected_count}
                                    gradient="from-purple-500 to-pink-500"
                                />
                                <StatCard
                                    label="New Subscriptions"
                                    value={detectResult.created_count}
                                    gradient="from-green-500 to-emerald-500"
                                />
                            </div>

                            <button
                                onClick={handleViewDashboard}
                                className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
                            >
                                View Dashboard
                                <CheckCircle2 className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface StepIndicatorProps {
    number: number;
    label: string;
    isActive: boolean;
    isComplete: boolean;
}

function StepIndicator({ number, label, isActive, isComplete }: StepIndicatorProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`
          w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300
          ${isComplete ? 'bg-green-500 text-white' : ''}
          ${isActive && !isComplete ? 'bg-primary text-primary-foreground scale-110' : ''}
          ${!isActive && !isComplete ? 'bg-muted text-muted-foreground' : ''}
        `}
            >
                {isComplete ? <CheckCircle2 className="h-6 w-6" /> : number}
            </div>
            <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
            </span>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number;
    gradient: string;
}

function StatCard({ label, value, gradient }: StatCardProps) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
            <div className="relative text-center space-y-2">
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
