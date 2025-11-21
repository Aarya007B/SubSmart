import Link from 'next/link';
import { ArrowRight, Upload, BarChart3, TrendingUp, Shield, Zap, Brain } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 animate-gradient" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-foreground">Manage Your</span>
              <span className="block bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Subscriptions Smartly
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
              Track, analyze, and optimize your recurring payments with AI-powered insights.
              Never miss a billing date or overpay again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/upload"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-border bg-background text-foreground font-semibold text-lg transition-all duration-300 hover:bg-accent hover:border-primary/50"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your subscriptions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Upload className="h-8 w-8" />}
              title="Easy Import"
              description="Upload your bank transactions in CSV format and let our AI detect recurring subscriptions automatically."
              gradient="from-blue-500 to-cyan-500"
            />

            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Smart Detection"
              description="Advanced algorithms identify subscription patterns from your transaction history with high accuracy."
              gradient="from-purple-500 to-pink-500"
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Visual Analytics"
              description="Beautiful charts and graphs help you understand your spending patterns at a glance."
              gradient="from-orange-500 to-red-500"
            />

            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Insights & Trends"
              description="Get actionable insights on spending trends, unused subscriptions, and savings opportunities."
              gradient="from-green-500 to-emerald-500"
            />

            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Proration Engine"
              description="Calculate refunds for cancelled subscriptions with our intelligent proration system."
              gradient="from-indigo-500 to-blue-500"
            />

            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Real-time Updates"
              description="Stay informed with upcoming billing alerts and subscription renewal notifications."
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-blue-600 p-12 md:p-16 text-center animate-gradient">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to take control?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Start tracking your subscriptions today and discover potential savings.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-primary font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Upload Your Data
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative space-y-4">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br ${gradient} text-white transition-transform group-hover:scale-110`}>
          {icon}
        </div>

        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>

        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
