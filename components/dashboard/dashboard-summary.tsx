'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Zap, Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardSummaryProps {
    userId: string;
}

export function DashboardSummary({ userId }: DashboardSummaryProps) {
    // Fetch portfolio data
    const { data: portfolio } = useQuery({
        queryKey: ['portfolio', userId],
        queryFn: async () => {
            const resp = await fetch(`/api/python/portfolio/${userId}`);
            return resp.json();
        },
        refetchInterval: 10000,
    });

    // Fetch alerts data
    const { data: alertsResponse } = useQuery({
        queryKey: ['alerts', userId],
        queryFn: async () => {
            const resp = await fetch(`/api/python/alerts?user_id=${userId}`);
            const data = await resp.json();
            return Array.isArray(data) ? data : (data.alerts || []);
        },
    });

    const assets = Array.isArray(portfolio) ? portfolio : (portfolio?.assets || []);
    const alerts = alertsResponse || [];

    // Calculate total portfolio value
    const totalValue = assets.reduce((sum: number, asset: any) => {
        return sum + (asset.current_price || 0);
    }, 0);

    // Calculate 24h P&L
    const totalPnL = assets.reduce((sum: number, asset: any) => {
        const priceChange = asset.price_change_24h || 0;
        const currentPrice = asset.current_price || 0;
        return sum + (currentPrice * priceChange / 100);
    }, 0);

    const pnlPercentage = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

    // Count active alerts
    const activeAlertsCount = alerts.filter((a: any) => a.is_active).length;
    const uniqueAssets = new Set(alerts.map((a: any) => a.asset_symbol)).size;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Portfolio Value */}
            <div className="bg-binance-surface p-5 rounded-xl border border-binance-border hover:border-binance-brand/30 transition-all cursor-pointer group">
                <p className="text-xs text-binance-secondary font-medium mb-1">Total Portfolio Value</p>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-mono font-bold">
                        {totalValue > 0 ? `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0'}
                    </h2>
                    {pnlPercentage !== 0 && (
                        <span className={`text-xs font-medium ${pnlPercentage > 0 ? 'text-binance-up' : 'text-binance-down'}`}>
                            {pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                        </span>
                    )}
                </div>
            </div>

            {/* Today's P&L */}
            <Link href="/terminal/BTC-USD" className="bg-binance-surface p-5 rounded-xl border border-binance-border hover:border-binance-brand/30 transition-all group">
                <p className="text-xs text-binance-secondary font-medium mb-1 flex justify-between">
                    Today&apos;s P&L
                    <Zap className="w-3 h-3 text-binance-brand opacity-0 group-hover:opacity-100 transition-all" />
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-3xl font-mono font-bold ${totalPnL >= 0 ? 'text-binance-up' : 'text-binance-down'}`}>
                        {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </h2>
                    <span className="text-xs font-medium">
                        {totalPnL >= 0 ? <TrendingUp className="w-3 h-3 text-binance-up" /> : <TrendingDown className="w-3 h-3 text-binance-down" />}
                    </span>
                </div>
            </Link>

            {/* Active Alerts */}
            <Link href="/dashboard/alerts" className="bg-binance-surface p-5 rounded-xl border border-binance-border hover:border-binance-brand/30 transition-all group">
                <p className="text-xs text-binance-secondary font-medium mb-1 flex justify-between">
                    Active Alerts
                    <Bell className="w-3 h-3 text-binance-brand opacity-0 group-hover:opacity-100 transition-all" />
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-mono font-bold">{activeAlertsCount}</h2>
                    <span className="text-xs text-binance-secondary font-medium">
                        {uniqueAssets > 0 ? `Across ${uniqueAssets} asset${uniqueAssets > 1 ? 's' : ''}` : 'No alerts set'}
                    </span>
                </div>
            </Link>
        </div>
    );
}
