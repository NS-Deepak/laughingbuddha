import { create } from 'zustand';

export interface Asset {
    id: string;
    symbol: string;
    name: string;
    asset_type: 'STOCK' | 'CRYPTO' | 'COMMODITY';
    exchange: string;
    added_at: string;
    current_price?: number;
    price_change_24h?: number;
}

interface PortfolioState {
    assets: Asset[];
    isLoading: boolean;
    setAssets: (assets: Asset[]) => void;
    setLoading: (loading: boolean) => void;
    removeAsset: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    assets: [],
    isLoading: false,
    setAssets: (assets) => set({ assets }),
    setLoading: (loading) => set({ isLoading: loading }),
    removeAsset: (id) => set((state) => ({
        assets: state.assets.filter((a) => a.id !== id)
    })),
}));
