'use client';

import { useEffect, useState } from 'react';
import { getInsights, type InsightsData } from '@/lib/api';
import Chart from '@/components/chart';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function InsightsPage() {
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getInsights();
            setInsights(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading insights...</p>
                </div>
            </div>
        );
    }

    if (error || !insights) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">Error Loading Insights</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={loadInsights}
                        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const categoryData = insights.category_breakdown.map(cat => ({
        name: cat.category,
        value: cat.amount,
        amount: cat.amount,
    }));

    const trendData = insights.spending_trend.map(item => ({
        name: item.month,
        amount: item.amount,
        value: item.amount,
    }));

    return (
        <div className="relative min-h-[calc(100vh-4rem)] py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                            Insights & Analytics
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Deep dive into your subscription spending patterns
                        </p>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                        <OverviewCard
                            icon={<DollarSign className="h-6 w-6" />}
                            label="Monthly Spending"
                            value={formatCurrency(insights.total_monthly_cost)}
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <OverviewCard
                            icon={<TrendingUp className="h-6 w-6" />}
                            label="Yearly Projection"
                            value={formatCurrency(insights.total_yearly_cost)}
                            gradient="from-purple-500 to-pink-500"
                        />
                        <OverviewCard
                            icon={<CreditCard className="h-6 w-6" />}
                            label="Active Subscriptions"
                            value={insights.subscription_count.toString()}
                            gradient="from-green-500 to-emerald-500"
                        />
                        <OverviewCard
                            icon={<TrendingUp className="h-6 w-6" />}
                            label="Avg per Subscription"
                            value={formatCurrency(insights.average_per_subscription)}
                            gradient="from-orange-500 to-red-500"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <Chart
                            type="line"
                            data={trendData}
                            xKey="name"
                            yKey="amount"
                            title="Spending Trend (Last 6 Months)"
                            height={350}
                        />

                        {categoryData.length > 0 && (
                            <Chart
                                type="pie"
                                data={categoryData}
                                dataKey="value"
                                title="Category Breakdown"
                                height={350}
                            />
                        )}
                    </div>

                    {/* Bar Chart */}
                    {categoryData.length > 0 && (
                        <Chart
                            type="bar"
                            data={categoryData}
                            xKey="name"
                            yKey="amount"
                            title="Spending by Category"
                            height={350}
                        />
                    )}

                    {/* Highest Spend */}
                    {insights.highest_spend && (
                        <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-semibold text-foreground">Highest Spend</h2>
                            </div>
                            <div className="flex items-center justify-between p-6 rounded-lg bg-accent/30 border border-border">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {insights.highest_spend.merchant_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                                        {insights.highest_spend.frequency}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-primary">
                                        {formatCurrency(insights.highest_spend.amount)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        per {insights.highest_spend.frequency}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Payments */}
                    {insights.predicted_upcoming_payments.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-semibold text-foreground">Upcoming Payments (Next 30 Days)</h2>
                            </div>
                            <div className="space-y-3">
                                {insights.predicted_upcoming_payments.map((payment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{payment.merchant_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    In {payment.days_until} day{payment.days_until !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-foreground">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(payment.billing_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unused Subscriptions */}
                    {insights.unused_subscriptions.length > 0 && (
                        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                <h2 className="text-2xl font-semibold text-foreground">Potentially Unused Subscriptions</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                These subscriptions might not be in use. Consider reviewing or cancelling them.
                            </p>
                            <div className="space-y-3">
                                {insights.unused_subscriptions.map((sub, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-foreground">{sub.merchant_name}</h3>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {sub.reason}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-foreground">
                                                {formatCurrency(sub.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {sub.frequency}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface OverviewCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    gradient: string;
}

function OverviewCard({ icon, label, value, gradient }: OverviewCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

            <div className="relative space-y-3">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
                    {icon}
                </div>

                <div>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{label}</p>
                </div>
            </div>
        </div>
    );
}
