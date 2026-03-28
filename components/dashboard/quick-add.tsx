'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Zap, TrendingUp, Coins, Gem, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuickAsset {
    symbol: string;
    name: string;
    type: "STOCK" | "CRYPTO" | "COMMODITY";
    exchange: string;
}

const QUICK_ASSETS: QuickAsset[] = [
    { symbol: "SWIGGY.NS", name: "SWIGGY", type: "STOCK", exchange: "NSE" },
    { symbol: "TCS.NS", name: "TCS", type: "STOCK", exchange: "NSE" },
    { symbol: "INFY.NS", name: "Infosys", type: "STOCK", exchange: "NSE" },
    { symbol: "BTC-USD", name: "Bitcoin", type: "CRYPTO", exchange: "CCC" },
    { symbol: "ETH-USD", name: "Ethereum", type: "CRYPTO", exchange: "CCC" },
    { symbol: "SOL-USD", name: "Solana", type: "CRYPTO", exchange: "CCC" },
    { symbol: "GC=F", name: "Gold", type: "COMMODITY", exchange: "COMEX" },
    { symbol: "SI=F", name: "Silver", type: "COMMODITY", exchange: "COMEX" },
];

export function QuickAdd({ userId }: { userId: string }) {
    const queryClient = useQueryClient();
    const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (asset: QuickAsset) => {
            setErrorMessage(null);
            const response = await fetch("/api/portfolio/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol: asset.symbol,
                    name: asset.name,
                    assetType: asset.type,
                    exchange: asset.exchange,
                }),
            });

            let data: any = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                const validationMessage =
                    data?.details && typeof data.details === "object"
                        ? Object.values(data.details).flat().filter(Boolean)[0]
                        : null;
                const message = data.error || data.detail || validationMessage || "Failed to add asset";
                throw new Error(message);
            }

            return { asset, data };
        },
        onMutate: async (newAsset) => {
            await queryClient.cancelQueries({ queryKey: ["portfolio", userId] });
            const previousAssets = queryClient.getQueryData(["portfolio", userId]);

            queryClient.setQueryData(["portfolio", userId], (old: any) => {
                const assets = Array.isArray(old) ? old : (old?.assets || []);

                if (assets.some((a: any) => a.symbol === newAsset.symbol)) {
                    return assets;
                }

                const optimisticAsset = {
                    id: `temp-${Date.now()}`,
                    symbol: newAsset.symbol,
                    name: newAsset.name,
                    asset_type: newAsset.type,
                    exchange: newAsset.exchange,
                    current_price: null,
                    price_change_24h: null,
                    added_at: new Date().toISOString()
                };
                return [optimisticAsset, ...assets];
            });

            setAddedSymbols(prev => new Set(prev).add(newAsset.symbol));
            return { previousAssets };
        },
        onSuccess: (result) => {
            setTimeout(() => {
                setAddedSymbols(prev => {
                    const next = new Set(prev);
                    next.delete(result.asset.symbol);
                    return next;
                });
            }, 2000);
        },
        onError: (err, newAsset, context) => {
            queryClient.setQueryData(["portfolio", userId], context?.previousAssets);
            setAddedSymbols(prev => {
                const next = new Set(prev);
                next.delete(newAsset.symbol);
                return next;
            });
            setErrorMessage(err instanceof Error ? err.message : "Failed to add asset");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio", userId] });
        }
    });

    return (
        <div className="space-y-4">
            {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    {errorMessage.includes('limit') ? (
                        <span>
                            {errorMessage}{' '}
                            <a href="/dashboard/plans" className="underline hover:text-red-100">Upgrade now</a>
                        </span>
                    ) : errorMessage}
                </div>
            )}
            <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-binance-brand" />
                <h3 className="text-sm font-bold text-binance-text uppercase tracking-wider italic">Fast Picks</h3>
                <span className="text-[10px] text-binance-secondary ml-2">One-click watchlist add</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {QUICK_ASSETS.map((asset) => {
                    const isAdded = addedSymbols.has(asset.symbol);
                    const isLoading = mutation.isPending && mutation.variables?.symbol === asset.symbol && !isAdded;

                    return (
                        <button
                            key={asset.symbol}
                            onClick={() => mutation.mutate(asset)}
                            disabled={mutation.isPending || isAdded}
                            className={cn(
                                "group flex flex-col items-start p-3 bg-binance-surface border border-binance-border rounded-xl hover:border-binance-brand/50 transition-all text-left relative overflow-hidden",
                                isLoading && "opacity-50 cursor-wait",
                                isAdded && "border-binance-up bg-binance-up/5"
                            )}
                        >
                            <div className="flex items-center justify-between w-full mb-1">
                                {asset.type === "STOCK" && <TrendingUp className="w-3 h-3 text-blue-400" />}
                                {asset.type === "CRYPTO" && <Coins className="w-3 h-3 text-yellow-500" />}
                                {asset.type === "COMMODITY" && <Gem className="w-3 h-3 text-orange-400" />}
                                {isAdded ? (
                                    <CheckCircle2 className="w-3 h-3 text-binance-up" />
                                ) : (
                                    <Plus className="w-3 h-3 text-binance-secondary group-hover:text-binance-brand transition-colors" />
                                )}
                            </div>
                            <span className="text-[11px] font-bold text-binance-text truncate w-full">
                                {asset.symbol.split('.')[0].split('-')[0]}
                            </span>
                            <span className="text-[9px] text-binance-secondary truncate w-full">{asset.name}</span>

                            <div className="absolute inset-0 bg-binance-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
