import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    user_id: number;
}

export interface Subscription {
    id: number;
    merchant_name: string;
    amount: number;
    frequency: string;
    start_date: string;
    next_billing_date: string | null;
    status: string;
    user_id: number;
}

export interface UploadResponse {
    status: string;
    message: string;
    transaction_count: number;
    filename: string;
}

export interface DetectResponse {
    status: string;
    detected_count: number;
    created_count: number;
    subscriptions: any[];
}

export interface InsightsData {
    total_monthly_cost: number;
    total_yearly_cost: number;
    subscription_count: number;
    highest_spend: {
        id: number;
        merchant_name: string;
        amount: number;
        frequency: string;
    } | null;
    unused_subscriptions: any[];
    predicted_upcoming_payments: any[];
    category_breakdown: { category: string; amount: number }[];
    spending_trend: { month: string; amount: number }[];
    average_per_subscription: number;
}

// API Functions

/**
 * Upload CSV file
 */
export async function uploadCSV(file: File, userId: number = 1): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/api/upload?user_id=${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}

/**
 * Get all transactions
 */
export async function getTransactions(userId: number = 1): Promise<Transaction[]> {
    const response = await api.get(`/api/transactions?user_id=${userId}`);
    return response.data;
}

/**
 * Get all subscriptions
 */
export async function getSubscriptions(userId: number = 1, status?: string): Promise<Subscription[]> {
    const params = new URLSearchParams({ user_id: String(userId) });
    if (status) params.append('status', status);

    const response = await api.get(`/api/subscriptions?${params.toString()}`);
    return response.data;
}

/**
 * Get single subscription by ID
 */
export async function getSubscription(subscriptionId: number): Promise<Subscription> {
    const response = await api.get(`/api/subscriptions/${subscriptionId}`);
    return response.data;
}

/**
 * Detect recurring subscriptions
 */
export async function detectSubscriptions(userId: number = 1): Promise<DetectResponse> {
    const response = await api.post(`/api/subscriptions/detect?user_id=${userId}`);
    return response.data;
}

/**
 * Get insights data
 */
export async function getInsights(userId: number = 1): Promise<InsightsData> {
    const response = await api.get(`/api/insights?user_id=${userId}`);
    return response.data;
}

/**
 * Update subscription
 */
export async function updateSubscription(
    subscriptionId: number,
    data: Partial<Subscription>
): Promise<Subscription> {
    const response = await api.put(`/api/subscriptions/${subscriptionId}`, data);
    return response.data;
}

/**
 * Delete subscription
 */
export async function deleteSubscription(subscriptionId: number): Promise<{ status: string; message: string }> {
    const response = await api.delete(`/api/subscriptions/${subscriptionId}`);
    return response.data;
}

/**
 * Calculate proration
 */
export async function calculateProration(
    subscriptionId: number,
    cancellationDate: string
): Promise<any> {
    const response = await api.post(`/api/subscriptions/${subscriptionId}/prorate`, {
        cancellation_date: cancellationDate,
    });
    return response.data;
}

export default api;
