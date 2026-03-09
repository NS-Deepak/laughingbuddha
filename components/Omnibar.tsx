"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { AddAlertDialog } from "@/components/AddAlertDialog";

interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
}

export function Omnibar({ onSelect }: { onSelect?: (asset: SearchResult) => void }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState<SearchResult | null>(null);

    React.useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/python/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (!res.ok) {
                    console.error("Search API error:", res.status);
                    setResults([]);
                    return;
                }
                const data = await res.json();
                // Backend returns array directly, not {results: [...]}
                setResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    className="flex h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search stocks (Zomato), crypto (BTC), or commodities..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 z-50">
                    <div className="p-1">
                        {results.map((result) => (
                            <div
                                key={result.symbol}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => {
                                    setSelected(result);
                                    setOpen(false);
                                    setQuery("");
                                }}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium">{result.symbol}</span>
                                    <span className="text-xs text-muted-foreground">{result.name} • {result.exchange}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selected && (
                <AddAlertDialog
                    asset={selected}
                    onClose={() => setSelected(null)}
                    onSuccess={() => {
                        setSelected(null);
                        // Optionally trigger a refresh or toast
                        window.location.reload(); // Simple refresh for now
                    }}
                />
            )}
        </div>
    );
}
