'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSubscription, deleteSubscription, calculateProration, type Subscription } from '@/lib/api';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Trash2, Calculator, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export default function SubscriptionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const subscriptionId = Number(params.id);

    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showProration, setShowProration] = useState(false);
    const [prorationDate, setProrationDate] = useState<string>('');
    const [prorationResult, setProrationResult] = useState<any>(null);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        loadSubscription();
    }, [subscriptionId]);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getSubscription(subscriptionId);
            setSubscription(data);
            setProrationDate(new Date().toISOString().split('T')[0]);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this subscription?')) return;

        try {
            await deleteSubscription(subscriptionId);
            router.push('/dashboard');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete subscription');
        }
    };

    const handleCalculateProration = async () => {
        if (!prorationDate || !subscription) return;

        try {
            setCalculating(true);
            const result = await calculateProration(subscriptionId, prorationDate);
            setProrationResult(result);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to calculate proration');
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading subscription details...</p>
                </div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">Subscription Not Found</h2>
                    <p className="text-muted-foreground">{error || 'Unable to load subscription details'}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const statusColor = subscription.status === 'active'
        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';

    return (
        <div className="relative min-h-[calc(100vh-4rem)] py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="space-y-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    {/* Main Details Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 animate-fade-in">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

                        <div className="relative space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-bold text-foreground">
                                        {subscription.merchant_name}
                                    </h1>
                                    <span className={cn(
                                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize border',
                                        statusColor
                                    )}>
                                        {subscription.status}
                                    </span>
                                </div>

                                <button
                                    onClick={handleDelete}
                                    className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                                    aria-label="Delete subscription"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border">
                                <DetailItem
                                    icon={<DollarSign className="h-5 w-5" />}
                                    label="Amount"
                                    value={formatCurrency(subscription.amount)}
                                />
                                <DetailItem
                                    icon={<TrendingUp className="h-5 w-5" />}
                                    label="Frequency"
                                    value={subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
                                />
                                <DetailItem
                                    icon={<Calendar className="h-5 w-5" />}
                                    label="Start Date"
                                    value={formatDate(subscription.start_date)}
                                />
                                {subscription.next_billing_date && (
                                    <DetailItem
                                        icon={<Calendar className="h-5 w-5" />}
                                        label="Next Billing"
                                        value={formatDate(subscription.next_billing_date)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Proration Calculator */}
                    <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Calculator className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-semibold text-foreground">Proration Calculator</h2>
                        </div>

                        <p className="text-muted-foreground">
                            Calculate the refund amount if you were to cancel this subscription on a specific date.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cancellation-date" className="block text-sm font-medium text-foreground mb-2">
                                    Cancellation Date
                                </label>
                                <input
                                    type="date"
                                    id="cancellation-date"
                                    value={prorationDate}
                                    onChange={(e) => setProrationDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <button
                                onClick={handleCalculateProration}
                                disabled={calculating || !prorationDate}
                                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {calculating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="h-4 w-4" />
                                        Calculate Refund
                                    </>
                                )}
                            </button>

                            {prorationResult && (
                                <div className="mt-6 p-6 rounded-lg bg-accent/50 border border-border space-y-4 animate-fade-in">
                                    <h3 className="font-semibold text-foreground text-lg">Proration Results</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Days Used</p>
                                            <p className="text-xl font-bold text-foreground">{prorationResult.days_used}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Days Total</p>
                                            <p className="text-xl font-bold text-foreground">{prorationResult.total_days}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Charged Amount</p>
                                            <p className="text-xl font-bold text-foreground">
                                                {formatCurrency(prorationResult.charged_amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Refund Amount</p>
                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(prorationResult.refund_amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold text-foreground">{value}</p>
            </div>
        </div>
    );
}
