'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, Time } from 'lightweight-charts';
import { useCryptoStore } from '@/lib/stores/crypto-store';
import { cn } from "@/lib/utils";

interface CryptoChartProps {
    symbol: string;
}

export function CryptoChart({ symbol }: CryptoChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // Transient price from store
    const currentPrice = useCryptoStore(state => state.prices[symbol]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0B0E11' },
                textColor: '#848E9C',
            },
            grid: {
                vertLines: { color: '#1E2329' },
                horzLines: { color: '#1E2329' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                borderColor: '#2B3139',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#0ECB81',
            downColor: '#F6465D',
            borderVisible: false,
            wickUpColor: '#0ECB81',
            wickDownColor: '#F6465D',
        });

        // Mock initial data (since Phase 2 History API isn't built yet)
        const mockData: any[] = [];
        let baseTime = Math.floor(Date.now() / 1000) - 300 * 60;
        let basePrice = symbol.includes('BTC') ? 65000 : 3500;

        for (let i = 0; i < 300; i++) {
            const open = basePrice + Math.random() * 20 - 10;
            const close = open + Math.random() * 20 - 10;
            mockData.push({
                time: (baseTime + i * 60) as Time,
                open,
                high: Math.max(open, close) + 5,
                low: Math.min(open, close) - 5,
                close
            });
            basePrice = close;
        }

        seriesRef.current?.setData(mockData);

        const handleResize = () => {
            chartRef.current.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartRef.current.remove();
        };
    }, [symbol]);

    // Direct Update on price tick (bypass React re-render for performance)
    useEffect(() => {
        if (currentPrice && seriesRef.current) {
            // In a real app, we'd update the current candle
            // For demo, we just update the last point
            const lastCandle = {
                time: (Math.floor(Date.now() / 1000 / 60) * 60) as Time,
                open: currentPrice,
                high: currentPrice,
                low: currentPrice,
                close: currentPrice
            };
            seriesRef.current?.update(lastCandle);
        }
    }, [currentPrice]);

    return (
        <div className="w-full h-full relative group">
            <div ref={chartContainerRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold bg-binance-bg/80 px-2 py-1 rounded text-binance-text">{symbol}</span>
                    <span className={cn(
                        "text-lg font-mono font-medium drop-shadow-md",
                        currentPrice ? (currentPrice > 0 ? 'text-binance-up' : 'text-binance-down') : 'text-binance-text'
                    )}>
                        {currentPrice ? `$${currentPrice.toLocaleString()}` : 'Loading...'}
                    </span>
                </div>
            </div>
        </div>
    );
}
