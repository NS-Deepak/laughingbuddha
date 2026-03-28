'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface InlineSearchProps {
    userId: string;
    mode?: 'add' | 'navigate';
    onSelect?: (asset: any) => void;
    placeholder?: string;
    className?: string;
}

export function InlineSearch({
    userId,
    mode = 'add',
    onSelect,
    placeholder = "Search stocks, crypto, commodities...",
    className
}: InlineSearchProps) {
    const [query, setQuery] = useState('');
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: results, isLoading } = useQuery({
        queryKey: ['inline-search', query],
        queryFn: async () => {
            if (!query || query.length < 2) return [];
            const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!resp.ok) return [];
            const data = await resp.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: query.length > 1,
    });

    const addMutation = useMutation({
        mutationFn: async (asset: any) => {
            // Normalize asset_type to assetType (camelCase) and map INDEX to STOCK
            const normalizedType = asset.type === 'INDEX' ? 'STOCK' : asset.type;
            
            const resp = await fetch('/api/portfolio/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: asset.symbol,
                    name: asset.name,
                    assetType: normalizedType,
                    exchange: asset.exchange || 'UNKNOWN'
                }),
            });

            if (!resp.ok) {
                const error = await resp.json();
                throw new Error(error.detail || 'Failed to add asset');
            }
            return resp.json();
        },
        onMutate: async (newAsset) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['portfolio', userId] });

            // Snapshot previous value
            const previousAssets = queryClient.getQueryData(['portfolio', userId]);

            // Optimistically update
            queryClient.setQueryData(['portfolio', userId], (old: any) => {
                const assets = Array.isArray(old) ? old : (old?.assets || []);
                // Prevent duplicate addition in optimisic state
                if (assets.some((a: any) => a.symbol === newAsset.symbol)) {
                    return assets;
                }
                const optimisticAsset = {
                    id: `temp-${Date.now()}`,
                    symbol: newAsset.symbol,
                    name: newAsset.name,
                    asset_type: newAsset.type,
                    exchange: newAsset.exchange,
                    current_price: newAsset.price || null, // Use price from search results if available
                    price_change_24h: null,
                    added_at: new Date().toISOString()
                };
                return [optimisticAsset, ...assets];
            });

            setQuery(''); // Clear search immediately

            return { previousAssets };
        },
        onSuccess: () => {
            // Refetch in background
        },
        onError: (err, newAsset, context) => {
            // Rollback
            queryClient.setQueryData(['portfolio', userId], context?.previousAssets);
            alert(err.message);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio', userId] });
        },
    });

    const handleSelect = (asset: any) => {
        if (onSelect) {
            onSelect(asset);
            setQuery('');
            return;
        }

        if (mode === 'navigate') {
            router.push(`/terminal/${asset.symbol}`);
            setQuery('');
        } else {
            addMutation.mutate(asset);
        }
    };

    // Symbol cleanup logic
    const cleanSymbol = (symbol: string) => {
        return symbol.replace(/\.NS$|\.BO$|-USD$|---inr/i, '');
    };

    return (
        <div className={cn("relative w-full", className)}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-binance-secondary" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-binance-surface border border-binance-border rounded-xl pl-11 pr-12 py-2.5 text-sm text-binance-text placeholder:text-binance-secondary focus:outline-none focus:border-binance-brand transition-colors"
                />
                {isLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-binance-secondary" />
                )}
            </div>

            {/* Results Dropdown */}
            {query.length > 1 && results && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-binance-surface border border-binance-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {results.map((asset: any) => (
                        <button
                            key={asset.symbol}
                            onClick={() => handleSelect(asset)}
                            disabled={addMutation.isPending}
                            className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-binance-bg transition-colors group border-b border-binance-border/50 last:border-0"
                        >
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-binance-text">{cleanSymbol(asset.symbol)}</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 text-[9px] font-black rounded border",
                                        asset.type === 'CRYPTO' && "bg-binance-brand/10 text-binance-brand border-binance-brand/30",
                                        asset.type === 'STOCK' && "bg-blue-500/10 text-blue-400 border-blue-500/30",
                                        asset.type === 'COMMODITY' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
                                        asset.type === 'INDEX' && "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                    )}>
                                        {asset.type}
                                    </span>
                                </div>
                                <span className="text-xs text-binance-secondary truncate max-w-[300px]">{asset.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {asset.price && (
                                    <span className="text-sm font-mono text-binance-text mr-2">{asset.price}</span>
                                )}
                                <span className="text-[10px] text-binance-secondary">{asset.exchange}</span>
                                {mode === 'add' ? (
                                    <Plus className="w-4 h-4 text-binance-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 text-binance-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results Hint */}
            {query.length > 1 && !isLoading && results && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-binance-surface border border-binance-border rounded-xl shadow-2xl p-4 z-50 text-center text-sm text-binance-secondary animate-in fade-in duration-200">
                    No results for "{query}"
                </div>
            )}
        </div>
    );
}
