'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CryptoChart } from '@/components/terminal/crypto-chart';
import { InlineSearch } from '@/components/portfolio/inline-search';
import Link from 'next/link';
import { ChevronLeft, Share2, Star, Zap, Heart, BarChart3, Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { SidebarProvider } from '@/components/layout/sidebar-context';
import { Sidebar } from '@/components/layout/sidebar';

interface Trade {
  id: number;
  price: number;
  amount: number;
  time: number;
  isBuyerMaker: boolean;
}

interface OrderBookEntry {
  price: number;
  amount: number;
}

export default function TerminalPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() || 'BTC-USD';
  const [activeTab, setActiveTab] = useState<'price' | 'technical' | 'depth'>('price');
  const [isFavorite, setIsFavorite] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({
    asks: [],
    bids: []
  });
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Convert symbol for Binance (BTC-USD -> btcusdt)
  const binanceSymbol = symbol.toLowerCase().replace('-', '').replace('usd', 'usdt');

  // WebSocket for trades and orderbook
  useEffect(() => {
    setTrades([]);
    setOrderBook({ asks: [], bids: [] });
    
    const tradeWs = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`);
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@depth20@100ms`);
    
    tradeWs.onerror = (err) => console.error('Trade WebSocket error:', err);
    depthWs.onerror = (err) => console.error('Depth WebSocket error:', err);

    tradeWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const trade: Trade = {
        id: data.t,
        price: parseFloat(data.p),
        amount: parseFloat(data.q),
        time: data.T,
        isBuyerMaker: data.m
      };
      setTrades(prev => [trade, ...prev].slice(0, 50));
      setCurrentPrice(trade.price);
    };
    
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrderBook({
        asks: data.asks.slice(0, 15).map((a: string[]) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
        bids: data.bids.slice(0, 15).map((b: string[]) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) }))
      });
    };
    
    return () => {
      if (tradeWs.readyState === WebSocket.OPEN || tradeWs.readyState === WebSocket.CONNECTING) {
        tradeWs.close();
      }
      if (depthWs.readyState === WebSocket.OPEN || depthWs.readyState === WebSocket.CONNECTING) {
        depthWs.close();
      }
    };
  }, [binanceSymbol]);

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  };

  // Handle favorite toggle
  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${symbol} - Laughing Buddha`,
          text: `Check out ${symbol} on Laughing Buddha Terminal`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Handle trade button
  const handleTrade = () => {
    alert(`Trade functionality for ${symbol} - Coming soon!`);
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-binance-bg text-binance-text overflow-hidden pb-16 md:pb-0">
        <Sidebar />
      {/* Top Navigation */}
      <header className="h-14 border-b border-binance-border flex items-center justify-between px-4 bg-binance-surface/50 gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard" className="text-binance-secondary hover:text-binance-text transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-[1px] bg-binance-border" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">{symbol}</h1>
            <div className="flex items-center gap-1.5 bg-binance-bg px-2 py-0.5 rounded border border-binance-border">
              <Zap className="w-3 h-3 text-binance-brand fill-binance-brand" />
              <span className="text-[10px] font-black uppercase text-binance-brand">Live</span>
            </div>
          </div>
        </div>

        {/* Search — hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-auto">
          <InlineSearch
            userId="demo_user"
            mode="navigate"
            placeholder="Search another asset..."
            className="max-w-md w-full"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleFavorite}
              className={`p-2 hover:text-binance-brand transition-colors ${isFavorite ? 'text-red-500' : 'text-binance-secondary'}`}
            >
              {isFavorite ? <Heart className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleShare}
              className="p-2 text-binance-secondary hover:text-binance-text"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleTrade}
            className="bg-binance-brand text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all shadow-lg shadow-binance-brand/10 shrink-0"
          >
            TRADE
          </button>
        </div>

        {/* Mobile: just share + trade */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={handleShare} className="p-2 text-binance-secondary">
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleTrade}
            className="bg-binance-brand text-black font-bold text-xs px-3 py-1.5 rounded-lg"
          >
            TRADE
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Watchlist */}
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
            {activeTab === 'price' && <CryptoChart symbol={symbol} />}
            {activeTab === 'technical' && (
              <div className="flex items-center justify-center h-full text-binance-secondary">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Technical Analysis</p>
                  <p className="text-xs mt-2">Coming soon - TradingView integration</p>
                </div>
              </div>
            )}
            {activeTab === 'depth' && (
              <div className="flex items-center justify-center h-full text-binance-secondary">
                <div className="text-center">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Market Depth</p>
                  <p className="text-xs mt-2">Real-time order book visualization</p>
                </div>
              </div>
            )}
          </div>

          {/* Chart Info Tabs */}
          <div className="h-10 border-t border-binance-border flex items-center px-4 gap-6 text-[11px] font-bold text-binance-secondary">
            <button 
              onClick={() => setActiveTab('price')}
              className={`h-full px-2 ${activeTab === 'price' ? 'text-binance-brand border-b-2 border-binance-brand' : 'hover:text-binance-text'}`}
            >
              Price Chart
            </button>
            <button 
              onClick={() => setActiveTab('technical')}
              className={`h-full px-2 ${activeTab === 'technical' ? 'text-binance-brand border-b-2 border-binance-brand' : 'hover:text-binance-text'}`}
            >
              Technical Analysis
            </button>
            <button 
              onClick={() => setActiveTab('depth')}
              className={`h-full px-2 ${activeTab === 'depth' ? 'text-binance-brand border-b-2 border-binance-brand' : 'hover:text-binance-text'}`}
            >
              Depth
            </button>
          </div>
        </section>

        {/* Right Column: Order Book + Recent Trades — hidden on mobile */}
        <aside className="hidden lg:flex w-96 border-l border-binance-border flex-col bg-binance-surface/20">
          {/* Order Book - Side by Side */}
          <div className="h-[55%] flex flex-col border-b border-binance-border">
            <div className="px-4 py-2 border-b border-binance-border bg-binance-surface/50">
              <h3 className="text-[10px] font-bold text-binance-secondary uppercase tracking-widest">Order Book</h3>
            </div>
            
            {/* Header Row */}
            <div className="grid grid-cols-2 gap-1 px-2 py-1 text-[9px] font-bold text-binance-secondary uppercase border-b border-binance-border/50">
              <div className="flex items-center gap-1 text-binance-down">
                <ArrowDown className="w-3 h-3" />
                <span>Sell</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-binance-up">
                <span>Buy</span>
                <ArrowUp className="w-3 h-3" />
              </div>
            </div>

            {/* Side by Side Order Book */}
            <div className="flex-1 flex">
              {/* SELL (Asks) - Left Side */}
              <div className="flex-1 overflow-hidden flex flex-col justify-end border-r border-binance-border/30">
                {orderBook.asks.length > 0 ? (
                  orderBook.asks.slice(0, 10).map((ask, i) => (
                    <div key={i} className="grid grid-cols-2 px-2 py-0.5 hover:bg-binance-surface/50 relative text-[10px] font-mono">
                      <div className="absolute inset-y-0 right-0 bg-binance-down/10" style={{ width: `${(ask.amount / orderBook.asks[0].amount) * 100}%` }}></div>
                      <span className="text-binance-down z-10">{ask.price.toLocaleString()}</span>
                      <span className="text-right z-10 text-binance-text">{ask.amount.toFixed(3)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-binance-secondary text-xs">Loading...</div>
                )}
              </div>

              {/* BUY (Bids) - Right Side */}
              <div className="flex-1 overflow-hidden border-l border-binance-border/30">
                {orderBook.bids.length > 0 ? (
                  orderBook.bids.slice(0, 10).map((bid, i) => (
                    <div key={i} className="grid grid-cols-2 px-2 py-0.5 hover:bg-binance-surface/50 relative text-[10px] font-mono">
                      <span className="text-binance-up z-10">{bid.price.toLocaleString()}</span>
                      <span className="text-right z-10 text-binance-text">{bid.amount.toFixed(3)}</span>
                      <div className="absolute inset-y-0 left-0 bg-binance-up/10" style={{ width: `${(bid.amount / orderBook.bids[0].amount) * 100}%` }}></div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-binance-secondary text-xs">Loading...</div>
                )}
              </div>
            </div>

            {/* Spread */}
            <div className="bg-binance-surface py-2 px-3 border-t border-binance-border flex items-baseline justify-center gap-3">
              <span className="text-lg font-bold text-binance-text">
                {currentPrice > 0 ? currentPrice.toLocaleString() : '---'}
              </span>
              <span className="text-[10px] text-binance-secondary">
                Spread: {orderBook.asks[0] && orderBook.bids[0] ? (orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2) : '---'}
              </span>
            </div>
          </div>
          
          {/* Recent Trades */}
          <div className="h-[45%] flex flex-col">
            <div className="px-4 py-2 border-b border-binance-border bg-binance-surface/50">
              <h3 className="text-[10px] font-bold text-binance-secondary uppercase tracking-widest">Recent Trades</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 px-3 py-1 text-[9px] text-binance-secondary font-bold uppercase">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Time</span>
              </div>
              {trades.length > 0 ? (
                trades.slice(0, 30).map((trade, i) => (
                  <div key={trade.id || i} className="grid grid-cols-3 px-3 py-0.5 text-[11px] font-mono hover:bg-binance-surface/50">
                    <span className={trade.isBuyerMaker ? 'text-binance-down' : 'text-binance-up'}>
                      {trade.price.toLocaleString()}
                    </span>
                    <span className="text-right text-binance-text">{trade.amount.toFixed(4)}</span>
                    <span className="text-right text-binance-secondary">{formatTime(trade.time)}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-binance-secondary text-xs flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-binance-secondary border-t-binance-brand rounded-full animate-spin"></div>
                  Waiting for trades...
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-8 border-t border-binance-border flex items-center justify-between px-4 bg-binance-surface text-[10px] text-binance-secondary">
        <div className="flex gap-4">
          <span>Market Status: <span className="text-binance-up">Open</span></span>
          <span>Trades: <span className="text-binance-brand font-mono">{trades.length}</span></span>
        </div>
        <div className="flex gap-4">
          <span>© 2026 Laughing Buddha Pro</span>
        </div>
      </footer>
    </div>
    </SidebarProvider>
  );
}
