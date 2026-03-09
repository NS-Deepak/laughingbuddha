'use client';

import { useParams } from 'next/navigation';
import { CryptoChart } from '@/components/terminal/crypto-chart';
import { OrderBook } from '@/components/terminal/order-book';
import { useBinanceStream } from '@/hooks/use-binance-stream';
import { InlineSearch } from '@/components/portfolio/inline-search';
import Link from 'next/link';
import { ChevronLeft, Share2, Star, Zap } from 'lucide-react';

export default function TerminalPage() {
    const params = useParams();
    const symbol = (params.symbol as string)?.toUpperCase() || 'BTC-USD';

    // Start WebSocket stream
    useBinanceStream(symbol);

    return (
        <div className="flex flex-col h-screen bg-binance-bg text-binance-text overflow-hidden">
            {/* Top Navigation */}
            <header className="h-14 border-b border-binance-border flex items-center justify-between px-4 bg-binance-surface/50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-binance-secondary hover:text-binance-text transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-[1px] bg-binance-border" />
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold tracking-tight">{symbol}</h1>
                        <div className="flex items-center gap-1.5 bg-binance-bg px-2 py-0.5 rounded border border-binance-border">
                            <Zap className="w-3 h-3 text-binance-brand fill-binance-brand" />
                            <span className="text-[10px] font-black uppercase text-binance-brand">Live</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-xl mx-auto">
                    <InlineSearch
                        userId="demo_user"
                        mode="navigate"
                        placeholder="Search another asset..."
                        className="max-w-md w-full"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="p-2 text-binance-secondary hover:text-binance-brand"><Star className="w-4 h-4" /></button>
                        <button className="p-2 text-binance-secondary hover:text-binance-text"><Share2 className="w-4 h-4" /></button>
                    </div>
                    <button className="bg-binance-brand text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all shadow-lg shadow-binance-brand/10 shrink-0">
                        TRADE
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Column: Watchlist Placeholder */}
                <aside className="w-64 border-r border-binance-border hidden lg:flex flex-col bg-binance-surface/30">
                    <div className="p-4 border-b border-binance-border">
                        <h3 className="text-[10px] font-bold text-binance-secondary uppercase tracking-widest">Market Watch</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD'].map(s => (
                            <Link
                                key={s}
                                href={`/terminal/${s}`}
                                className={`flex justify-between items-center p-4 hover:bg-binance-surface border-b border-binance-border/50 transition-colors ${s === symbol ? 'bg-binance-surface border-l-2 border-l-binance-brand' : ''}`}
                            >
                                <span className="text-sm font-medium">{s}</span>
                                <span className="text-xs font-mono text-binance-up">+1.2%</span>
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Center Column: Chart */}
                <section className="flex-1 flex flex-col bg-binance-bg relative">
                    <div className="flex-1 p-4">
                        <CryptoChart symbol={symbol} />
                    </div>

                    {/* Chart Info Tabs */}
                    <div className="h-10 border-t border-binance-border flex items-center px-4 gap-6 text-[11px] font-bold text-binance-secondary">
                        <button className="text-binance-brand border-b-2 border-binance-brand h-full px-2">Price Chart</button>
                        <button className="hover:text-binance-text h-full px-2">Technical Analysis</button>
                        <button className="hover:text-binance-text h-full px-2">Depth</button>
                    </div>
                </section>

                {/* Right Column: Order Book */}
                <aside className="w-80 border-l border-binance-border flex flex-col bg-binance-surface/20">
                    <div className="h-1/2 flex flex-col">
                        <div className="px-4 py-2 border-b border-binance-border bg-binance-surface/50">
                            <h3 className="text-[10px] font-bold text-binance-secondary uppercase tracking-widest">Order Book</h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <OrderBook symbol={symbol} />
                        </div>
                    </div>
                    <div className="h-1/2 border-t border-binance-border flex flex-col">
                        <div className="px-4 py-2 border-b border-binance-border bg-binance-surface/50">
                            <h3 className="text-[10px] font-bold text-binance-secondary uppercase tracking-widest">Recent Trades</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 text-[11px] font-mono text-center text-binance-secondary">
                            Waiting for trades...
                        </div>
                    </div>
                </aside>
            </main>

            {/* Footer / Status Bar */}
            <footer className="h-8 border-t border-binance-border flex items-center justify-between px-4 bg-binance-surface text-[10px] text-binance-secondary">
                <div className="flex gap-4">
                    <span>Market Status: <span className="text-binance-up">Open</span></span>
                    <span>Latency: <span className="text-binance-up font-mono">12ms</span></span>
                </div>
                <div className="flex gap-4">
                    <span>© 2026 Laughing Buddha Pro</span>
                </div>
            </footer>
        </div>
    );
}
