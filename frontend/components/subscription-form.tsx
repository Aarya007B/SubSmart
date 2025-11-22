"use client";

import { useState } from 'react';
import { createSubscription } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SubscriptionForm() {
    const router = useRouter();
    const [merchant, setMerchant] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                merchant_name: merchant,
                amount: Number(amount),
                frequency,
                start_date: startDate,
                user_id: 1,
            };

            await createSubscription(payload as any);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.detail || err.message || 'Failed to create subscription');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground">Merchant</label>
                <input className="mt-1 block w-full rounded-md border p-2" value={merchant} onChange={e => setMerchant(e.target.value)} required />
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground">Amount</label>
                <input className="mt-1 block w-full rounded-md border p-2" value={amount} onChange={e => setAmount(e.target.value)} required inputMode="decimal" />
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground">Frequency</label>
                <select className="mt-1 block w-full rounded-md border p-2" value={frequency} onChange={e => setFrequency(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground">Start Date</label>
                <input type="date" className="mt-1 block w-full rounded-md border p-2" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end">
                <button className="px-4 py-2 rounded bg-primary text-primary-foreground font-medium">Create</button>
            </div>
        </form>
    );
}
