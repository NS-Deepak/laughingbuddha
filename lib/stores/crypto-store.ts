import { create } from 'zustand';

interface CryptoState {
    prices: Record<string, number>;
    updatePrice: (symbol: string, price: number) => void;
}

export const useCryptoStore = create<CryptoState>((set) => ({
    prices: {},
    updatePrice: (symbol, price) =>
        set((state) => ({
            prices: { ...state.prices, [symbol]: price }
        })),
}));
