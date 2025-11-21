'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export type ChartType = 'line' | 'bar' | 'pie';

interface ChartProps {
    type: ChartType;
    data: any[];
    dataKey?: string;
    xKey?: string;
    yKey?: string;
    colors?: string[];
    height?: number;
    title?: string;
    className?: string;
}

const DEFAULT_COLORS = [
    'hsl(221.2, 83.2%, 53.3%)',
    'hsl(142.1, 76.2%, 36.3%)',
    'hsl(38.9, 92.3%, 50.2%)',
    'hsl(280.2, 89.1%, 42.7%)',
    'hsl(340.4, 82.2%, 52.5%)',
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                {label && <p className="font-medium text-sm text-foreground mb-1">{label}</p>}
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm text-muted-foreground">
                        <span className="font-medium" style={{ color: entry.color }}>
                            {entry.name}:
                        </span>{' '}
                        {typeof entry.value === 'number' ? `$${entry.value.toFixed(2)}` : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Chart({
    type,
    data,
    dataKey = 'value',
    xKey = 'name',
    yKey = 'value',
    colors = DEFAULT_COLORS,
    height = 300,
    title,
    className,
}: ChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className={cn('flex items-center justify-center bg-card rounded-lg border border-border p-8', className)}>
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                            <XAxis
                                dataKey={xKey}
                                className="text-muted-foreground text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                className="text-muted-foreground text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '14px' }}
                                iconType="circle"
                            />
                            <Line
                                type="monotone"
                                dataKey={yKey}
                                stroke={colors[0]}
                                strokeWidth={3}
                                dot={{ fill: colors[0], r: 4 }}
                                activeDot={{ r: 6, fill: colors[0] }}
                                fill="url(#lineGradient)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                {colors.map((color, index) => (
                                    <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0.6} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                            <XAxis
                                dataKey={xKey}
                                className="text-muted-foreground text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                className="text-muted-foreground text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '14px' }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey={yKey}
                                fill="url(#barGradient0)"
                                radius={[8, 8, 0, 0]}
                                animationDuration={800}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={height / 3}
                                fill="#8884d8"
                                dataKey={dataKey}
                                animationDuration={800}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '14px' }}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div className={cn('bg-card rounded-xl border border-border p-6 shadow-sm', className)}>
            {title && (
                <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
            )}
            <div className="w-full">
                {renderChart()}
            </div>
        </div>
    );
}
