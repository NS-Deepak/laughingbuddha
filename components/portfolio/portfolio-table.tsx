'use client';

import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark } from 'ag-grid-community';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { PriceCell } from './cells/price-cell';
import { BadgeCell } from './cells/badge-cell';
import { ChangeCell } from './cells/change-cell';

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface PortfolioTableProps {
    userId: string;
}

export function PortfolioTable({ userId }: PortfolioTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: assets, isLoading } = useQuery({
        queryKey: ['portfolio', userId],
        queryFn: async () => {
            const resp = await fetch(`/api/portfolio/${userId}`);
            const data = await resp.json();
            return Array.isArray(data) ? data : (data.assets || []);
        },
        refetchInterval: 10000,
    });

    const deleteMutation = useMutation({
        mutationFn: async (assetId: string) => {
            const response = await fetch(`/api/portfolio/${assetId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete asset');
            return response.json();
        },
        onMutate: async (assetId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['portfolio', userId] });

            // Snapshot the previous value
            const previousAssets = queryClient.getQueryData(['portfolio', userId]);

            // Optimistically update to the new value
            queryClient.setQueryData(['portfolio', userId], (old: any) => {
                if (!old) return [];
                const list = Array.isArray(old) ? old : (old.assets || []);
                return list.filter((asset: any) => asset.id !== assetId);
            });

            return { previousAssets };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            queryClient.setQueryData(['portfolio', userId], context?.previousAssets);
            alert("Failed to delete asset. Please try again.");
        },
        onSettled: () => {
            // Refetch to be safe
            queryClient.invalidateQueries({ queryKey: ['portfolio', userId] });
        },
    });

    const filteredAssets = useMemo(() => {
        if (!assets) return [];
        if (!searchQuery) return assets;

        const query = searchQuery.toLowerCase();
        return assets.filter((asset: any) =>
            asset.name?.toLowerCase().includes(query) ||
            asset.symbol?.toLowerCase().includes(query)
        );
    }, [assets, searchQuery]);

    const columnDefs = useMemo(() => [
        {
            field: 'name',
            headerName: 'Asset',
            minWidth: 160,
            flex: 1,
            cellClass: 'flex items-center font-medium'
        },
        {
            field: 'symbol',
            headerName: 'Ticker',
            minWidth: 80,
            cellClass: 'flex items-center text-binance-secondary font-mono text-xs'
        },
        {
            field: 'asset_type',
            headerName: 'Type',
            minWidth: 120,
            cellRenderer: BadgeCell
        },
        {
            field: 'current_price',
            headerName: 'Price',
            minWidth: 110,
            cellRenderer: PriceCell
        },
        {
            field: 'price_change_24h',
            headerName: '24h Change',
            minWidth: 100,
            cellRenderer: ChangeCell
        },
        {
            headerName: 'Actions',
            width: 80,
            cellRenderer: (params: any) => (
                <button
                    className="text-binance-secondary hover:text-red-500 transition-colors disabled:opacity-50"
                    onClick={() => deleteMutation.mutate(params.data.id)}
                    disabled={deleteMutation.isPending}
                    title="Remove from watchlist"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: false,
        resizable: true,
        floatingFilter: false,
    }), []);

    const myTheme = themeQuartz
        .withPart(colorSchemeDark)
        .withParams({
            backgroundColor: "#0B0E11",
            foregroundColor: "#EAECEF",
            headerBackgroundColor: "#1E2329",
            rowHoverColor: "#2B3139",
        });


    // Empty state when no assets (but not loading)
    if (!isLoading && (!assets || assets.length === 0)) {
        return (
            <div className="p-12 text-center">
                <div className="max-w-sm mx-auto">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-bold text-binance-text mb-2">No Assets Yet</h3>
                    <p className="text-sm text-binance-secondary mb-4">
                        Use the search bar above or Fast Picks to add stocks, crypto, or commodities.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Search Bar */}
            <div className="p-3 border-b border-binance-border">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-binance-secondary group-focus-within:text-binance-brand transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter your watchlist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-binance-bg border border-binance-border rounded-lg pl-10 pr-4 py-2 text-sm text-binance-text placeholder:text-binance-secondary focus:outline-none focus:border-binance-brand transition-colors"
                    />
                </div>
            </div>

            {/* AG Grid Table */}
            <div className="w-full h-[500px] p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-binance-brand mx-auto mb-3"></div>
                            <p className="text-sm text-binance-secondary">Loading prices...</p>
                        </div>
                    </div>
                ) : (
                    <AgGridReact
                        rowData={filteredAssets}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        theme={myTheme}
                        gridOptions={{
                            rowHeight: 45,
                            headerHeight: 40,
                        }}
                    />
                )}
            </div>
        </>
    );
}
