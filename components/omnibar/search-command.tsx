'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Plus, Star, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SearchCommand() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const queryClient = useQueryClient();
    const router = useRouter();

    // Fix hydration error by confirming mount
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);

        // Toggle on Cmd+K
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', query],
        queryFn: async () => {
            if (!query || query.length < 2) return [];
            try {
                const resp = await fetch(`/api/python/search?q=${encodeURIComponent(query)}`);
                if (!resp.ok) return [];
                const data = await resp.json();
                return Array.isArray(data) ? data : [];
            } catch (err) {
                console.error('Search error:', err);
                return [];
            }
        },
        enabled: query.length > 1,
    });

    const addMutation = useMutation({
        mutationFn: async (asset: any) => {
            const resp = await fetch('/api/python/portfolio/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 'demo_user', // TODO: Get real user ID
                    symbol: asset.symbol,
                    name: asset.name,
                    asset_type: asset.type,
                    exchange: asset.exchange
                }),
            });

            if (!resp.ok) {
                const error = await resp.json();
                throw new Error(error.detail || 'Failed to add asset');
            }
            return resp.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
            setOpen(false);
            setQuery('');
            // Optional: Show toast success
        },
        onError: (error: Error) => {
            alert(error.message); // Simple alert for now
        },
    });

    if (!mounted) return null;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-binance-secondary bg-binance-surface border border-binance-border rounded-lg hover:border-binance-brand transition-all min-w-[200px]"
            >
                <Search className="w-3.5 h-3.5" />
                <span>Search assets...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-binance-border bg-binance-bg px-1.5 font-mono text-[10px] font-medium text-binance-secondary opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Command.Dialog
                open={open}
                onOpenChange={setOpen}
                label="Global Search"
                className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
            >
                <div className="w-full max-w-[550px] bg-binance-surface border border-binance-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center border-b border-binance-border px-4 py-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-binance-secondary" />
                        <Command.Input
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Type a ticker or asset name..."
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-binance-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-binance-secondary" />}
                    </div>

                    <Command.List className="max-h-[350px] overflow-y-auto p-2">
                        {!isLoading && results && results.length === 0 && (
                            <Command.Empty className="py-6 text-center text-sm text-binance-secondary">
                                {query.length < 2 ? 'Type at least 2 characters to search...' : 'No results found.'}
                            </Command.Empty>
                        )}

                        {results && results.length > 0 && (
                            <Command.Group heading="Market Results" className="px-2 pb-2 text-[10px] font-bold text-binance-secondary uppercase tracking-widest">
                                {results.map((asset: any) => (
                                    <Command.Item
                                        key={asset.symbol}
                                        value={`${asset.symbol} ${asset.name}`}
                                        onSelect={() => addMutation.mutate(asset)}
                                        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-default select-none outline-none aria-selected:bg-binance-bg transition-all group"
                                    >
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-binance-text">{asset.symbol}</span>
                                                <span className={cn(
                                                    "px-1.5 py-0.5 text-[9px] font-black rounded border",
                                                    asset.type === 'CRYPTO' ? 'text-purple-400 border-purple-900/50 bg-purple-900/10' : 'text-blue-400 border-blue-900/50 bg-blue-900/10'
                                                )}>
                                                    {asset.type}
                                                </span>
                                            </div>
                                            <span className="text-xs text-binance-secondary truncate max-w-[300px]">{asset.name}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono text-binance-text">
                                                {asset.type === 'CRYPTO' ? '$' : '₹'}{asset.price || '--'}
                                            </span>
                                            <button className="opacity-0 group-aria-selected:opacity-100 bg-binance-brand text-black p-1 rounded transition-all">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    <div className="flex items-center justify-between border-t border-binance-border bg-binance-bg/50 px-4 py-3 text-[10px] text-binance-secondary">
                        <span>Select an asset to add to your portfolio</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><kbd className="border border-binance-border px-1 rounded">Enter</kbd> to add</span>
                            <span className="flex items-center gap-1"><kbd className="border border-binance-border px-1 rounded">Esc</kbd> to close</span>
                        </div>
                    </div>
                </div>
            </Command.Dialog>
        </>
    );
}
