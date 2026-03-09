'use client';

import { useMemo } from 'react';

interface OrderBookProps {
    symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
    // Mock data generator for demo
    const asks = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        price: 65400 + i * 10,
        amount: Math.random() * 2,
        total: 0
    })).reverse(), []);

    const bids = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        price: 65380 - i * 10,
        amount: Math.random() * 2,
        total: 0
    })), []);

    return (
        <div className="flex flex-col h-full bg-binance-bg text-[11px] font-mono">
            <div className="grid grid-cols-3 px-3 py-2 text-binance-secondary border-b border-binance-border uppercase tracking-widest text-[9px] font-bold">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks (Red) */}
            <div className="flex-1 overflow-hidden flex flex-col justify-end">
                {asks.map((ask, i) => (
                    <div key={i} className="grid grid-cols-3 px-3 py-0.5 hover:bg-binance-surface relative">
                        <div className="absolute inset-y-0 right-0 bg-binance-down/10" style={{ width: `${Math.random() * 100}%` }}></div>
                        <span className="text-binance-down z-10">{ask.price.toLocaleString()}</span>
                        <span className="text-right z-10 text-binance-text">{ask.amount.toFixed(4)}</span>
                        <span className="text-right z-10 text-binance-text">{(ask.price * ask.amount / 1000).toFixed(2)}k</span>
                    </div>
                ))}
            </div>

            {/* Spread */}
            <div className="bg-binance-surface py-2 px-3 border-y border-binance-border flex items-baseline gap-2">
                <span className="text-lg font-bold text-binance-up">65,392.40</span>
                <span className="text-[10px] text-binance-secondary italic">$65,392.40</span>
            </div>

            {/* Bids (Green) */}
            <div className="flex-1 overflow-hidden">
                {bids.map((bid, i) => (
                    <div key={i} className="grid grid-cols-3 px-3 py-0.5 hover:bg-binance-surface relative">
                        <div className="absolute inset-y-0 right-0 bg-binance-up/10" style={{ width: `${Math.random() * 100}%` }}></div>
                        <span className="text-binance-up z-10">{bid.price.toLocaleString()}</span>
                        <span className="text-right z-10 text-binance-text">{bid.amount.toFixed(4)}</span>
                        <span className="text-right z-10 text-binance-text">{(bid.price * bid.amount / 1000).toFixed(2)}k</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
