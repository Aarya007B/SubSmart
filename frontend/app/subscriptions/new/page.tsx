import SubscriptionForm from '@/components/subscription-form';

export default function NewSubscriptionPage() {
    return (
        <div className="py-12 container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl p-8">
                <h1 className="text-2xl font-bold mb-4">Add Subscription</h1>
                <p className="text-sm text-muted-foreground mb-6">Fill the form below to add a subscription manually.</p>
                <SubscriptionForm />
            </div>
        </div>
    );
}
