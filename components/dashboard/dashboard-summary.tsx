'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardSummaryProps {
    userId: string;
}

// Currency symbol based on Yahoo Finance currency
function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'GBP': return '£';
    case 'KRW': return '₩';
    case 'RUB': return '₽';
    case 'BRL': return 'R$';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    default: return '$';
  }
}

export function DashboardSummary({ userId }: DashboardSummaryProps) {
    // Fetch portfolio data
    const { data: portfolio } = useQuery({
        queryKey: ['portfolio', userId],
        queryFn: async () => {
            const resp = await fetch(`/api/portfolio/${userId}`);
            return resp.json();
        },
        refetchInterval: 10000,
    });

    // Fetch alerts data
    const { data: alertsResponse } = useQuery({
        queryKey: ['alerts', userId],
        queryFn: async () => {
            const resp = await fetch(`/api/alerts?user_id=${userId}`);
            const data = await resp.json();
            return Array.isArray(data) ? data : (data.alerts || []);
        },
    });

    const assets = Array.isArray(portfolio) ? portfolio : (portfolio?.assets || []);
    const alerts = alertsResponse || [];

    // Calculate total portfolio value grouped by currency
    const currencyTotals: Record<string, { value: number; pnl: number }> = {};
    
    assets.forEach((asset: any) => {
        const currency = asset.currency || 'USD';
        const price = asset.current_price || 0;
        const change = asset.price_change_24h || 0;
        
        if (!currencyTotals[currency]) {
            currencyTotals[currency] = { value: 0, pnl: 0 };
        }
        
        currencyTotals[currency].value += price;
        // Calculate PnL contribution
        if (price > 0 && change !== 0) {
            currencyTotals[currency].pnl += (price * change / 100);
        }
    });

    // Get primary currency (first one with value)
    const primaryCurrency = Object.keys(currencyTotals)[0] || 'USD';
    const totalValue = currencyTotals[primaryCurrency]?.value || 0;
    const totalPnL = currencyTotals[primaryCurrency]?.pnl || 0;
    const pnlPercentage = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;
    const currencySymbol = getCurrencySymbol(primaryCurrency);

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
                        {totalValue > 0 ? `${currencySymbol}${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `${currencySymbol}0`}
                    </h2>
                    {pnlPercentage !== 0 && (
                        <span className={`text-xs font-medium ${pnlPercentage > 0 ? 'text-binance-up' : 'text-binance-down'}`}>
                            {pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                        </span>
                    )}
                </div>
                {Object.keys(currencyTotals).length > 1 && (
                    <p className="text-xs text-binance-secondary mt-1">
                        +{Object.keys(currencyTotals).length - 1} other currency{Object.keys(currencyTotals).length > 2 ? 'ies' : ''}
                    </p>
                )}
            </div>

            {/* Today's P&L */}
            <div className="bg-binance-surface p-5 rounded-xl border border-binance-border">
                <p className="text-xs text-binance-secondary font-medium mb-1">
                    Today's P&L
                </p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-3xl font-mono font-bold ${totalPnL >= 0 ? 'text-binance-up' : 'text-binance-down'}`}>
                        {totalPnL >= 0 ? '+' : ''}{currencySymbol}{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </h2>
                    <span className="text-xs font-medium">
                        {totalPnL >= 0 ? <TrendingUp className="w-3 h-3 text-binance-up" /> : <TrendingDown className="w-3 h-3 text-binance-down" />}
                    </span>
                </div>
            </div>

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
