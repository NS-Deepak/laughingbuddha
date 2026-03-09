import useWebSocket from 'react-use-websocket';
import { useCryptoStore } from '@/lib/stores/crypto-store';
import { useEffect } from 'react';

export function useBinanceStream(symbol: string) {
    const updatePrice = useCryptoStore(state => state.updatePrice);

    // Binance expects lowercase symbols without dashes (e.g. btcusdt)
    // Our symbol might be BTC-USD or BTC-USDT
    const streamSymbol = symbol.toLowerCase().replace('-', '').replace('usd', 'usdt');

    const socketUrl = `wss://stream.binance.com:9443/ws/${streamSymbol}@trade`;

    const { lastJsonMessage } = useWebSocket(socketUrl, {
        shouldReconnect: () => true,
        reconnectInterval: 3000,
    });

    useEffect(() => {
        if (lastJsonMessage && (lastJsonMessage as any).p) {
            updatePrice(symbol, parseFloat((lastJsonMessage as any).p));
        }
    }, [lastJsonMessage, symbol, updatePrice]);
}
