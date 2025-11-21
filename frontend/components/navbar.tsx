'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Home, Upload, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Insights', href: '/insights', icon: TrendingUp },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <CreditCard className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl transition-opacity group-hover:opacity-75" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            SubSmart
                        </span>
                    </Link>

                    <div className="hidden md:flex md:items-center md:space-x-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href ||
                                (item.href !== '/' && pathname?.startsWith(item.href));

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    <Icon className={cn(
                                        'h-4 w-4 transition-transform group-hover:scale-110',
                                        isActive && 'text-primary'
                                    )} />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu */}
                    <div className="flex md:hidden">
                        <div className="flex space-x-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href ||
                                    (item.href !== '/' && pathname?.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'p-2 rounded-lg transition-all',
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-accent'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
