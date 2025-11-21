'use client';

import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Subscription } from '@/lib/api';

interface SubscriptionCardProps {
    subscription: Subscription;
    onClick?: () => void;
}

const frequencyColors = {
    monthly: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    yearly: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    weekly: 'bg-green-500/10 text-green-600 dark:text-green-400',
    'bi-weekly': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

const statusColors = {
    active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export default function SubscriptionCard({ subscription, onClick }: SubscriptionCardProps) {
    const frequencyColor = frequencyColors[subscription.frequency as keyof typeof frequencyColors] || frequencyColors.monthly;
    const statusColor = statusColors[subscription.status as keyof typeof statusColors] || statusColors.active;

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300',
                'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-1',
                onClick && 'cursor-pointer'
            )}
        >
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {subscription.merchant_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                                frequencyColor
                            )}>
                                {subscription.frequency}
                            </span>
                            <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border',
                                statusColor
                            )}>
                                {subscription.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center text-2xl font-bold text-foreground">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span>{subscription.amount.toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            per {subscription.frequency.replace('-', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Started: {formatDate(subscription.start_date)}</span>
                    </div>

                    {subscription.next_billing_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-medium">Next: {formatDate(subscription.next_billing_date)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
    );
}
