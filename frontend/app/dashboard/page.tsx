'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionCard from '@/components/subscription-card';
import { getSubscriptions, type Subscription } from '@/lib/api';
import { DollarSign, TrendingUp, Calendar, Package, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getSubscriptions(1, 'active');
            setSubscriptions(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscriptionClick = (id: number) => {
        router.push(`/subscriptions/${id}`);
    };

    // Calculate stats
    const totalMonthly = subscriptions.reduce((sum, sub) => {
        if (sub.frequency === 'monthly') return sum + sub.amount;
        if (sub.frequency === 'yearly') return sum + sub.amount / 12;
        if (sub.frequency === 'weekly') return sum + sub.amount * 4.33;
        if (sub.frequency === 'bi-weekly') return sum + sub.amount * 2.17;
        return sum;
    }, 0);

    const totalYearly = totalMonthly * 12;
    const activeCount = subscriptions.filter(s => s.status === 'active').length;

    // Get upcoming renewals (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingRenewals = subscriptions
        .filter(sub => {
            if (!sub.next_billing_date) return false;
            const renewalDate = new Date(sub.next_billing_date);
            return renewalDate >= today && renewalDate <= thirtyDaysLater;
        })
        .sort((a, b) => {
            const dateA = new Date(a.next_billing_date!).getTime();
            const dateB = new Date(b.next_billing_date!).getTime();
            return dateA - dateB;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading your subscriptions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">Error Loading Dashboard</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={loadSubscriptions}
                        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-6 max-w-md animate-fade-in">
                    <Package className="h-20 w-20 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">No Subscriptions Yet</h2>
                        <p className="text-muted-foreground">
                            Upload your transaction data to discover your subscriptions
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/upload')}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold hover:scale-105 transition-transform"
                    >
                        Upload Data
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                            Dashboard
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Overview of your active subscriptions
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                        <StatsCard
                            icon={<Package className="h-6 w-6" />}
                            label="Active Subscriptions"
                            value={activeCount.toString()}
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <StatsCard
                            icon={<DollarSign className="h-6 w-6" />}
                            label="Monthly Spending"
                            value={formatCurrency(totalMonthly)}
                            gradient="from-green-500 to-emerald-500"
                        />
                        <StatsCard
                            icon={<TrendingUp className="h-6 w-6" />}
                            label="Yearly Projection"
                            value={formatCurrency(totalYearly)}
                            gradient="from-purple-500 to-pink-500"
                        />
                        <StatsCard
                            icon={<Calendar className="h-6 w-6" />}
                            label="Upcoming Renewals"
                            value={upcomingRenewals.length.toString()}
                            gradient="from-orange-500 to-red-500"
                        />
                    </div>

                    {/* Upcoming Renewals */}
                    {upcomingRenewals.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-foreground">Upcoming Renewals</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {upcomingRenewals.slice(0, 3).map((subscription) => (
                                    <div
                                        key={subscription.id}
                                        className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{subscription.merchant_name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {new Date(subscription.next_billing_date!).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <span className="text-lg font-bold text-foreground">
                                                {formatCurrency(subscription.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Subscriptions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-foreground">All Subscriptions</h2>
                            <span className="text-sm text-muted-foreground">
                                {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subscriptions.map((subscription) => (
                                <SubscriptionCard
                                    key={subscription.id}
                                    subscription={subscription}
                                    onClick={() => handleSubscriptionClick(subscription.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    gradient: string;
}

function StatsCard({ icon, label, value, gradient }: StatsCardProps) {
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
