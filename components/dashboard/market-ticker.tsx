'use client';

import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface TickerItem {
    symbol: string;
    name: string;
    price: number;
    change_pct: number;
    is_up: boolean;
}

export function MarketTicker() {
    const { data: tickerData = [], isLoading } = useQuery<TickerItem[]>({
        queryKey: ['market-ticker'],
        queryFn: async () => {
            const resp = await fetch('/api/python/ticker');
            if (!resp.ok) return [];
            return resp.json();
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading || tickerData.length === 0) {
        return (
            <div className="fixed bottom-0 left-0 right-0 h-6 bg-binance-surface border-t border-binance-border flex items-center px-4 overflow-hidden z-20">
                <div className="text-[10px] font-mono text-binance-secondary animate-pulse">
                    Loading market data...
                </div>
            </div>
        );
    }

    // Repeat the ticker data to ensure it fills the bar and scrolls smoothly
    const displayData = [...tickerData, ...tickerData, ...tickerData];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-6 bg-binance-surface border-t border-binance-border flex items-center px-4 overflow-hidden z-20">
            <div className="flex gap-8 animate-marquee whitespace-nowrap text-[10px] font-mono">
                {displayData.map((item, idx) => (
                    <span key={`${item.symbol}-${idx}`} className="text-binance-secondary uppercase tracking-tight">
                        {item.symbol}: <span className={item.is_up ? "text-binance-up" : "text-binance-down"}>
                            {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({item.change_pct > 0 ? '+' : ''}{item.change_pct}%)
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
