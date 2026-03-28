'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Info } from 'lucide-react';

export function AddAlertModal({
    userId,
    asset,
    onClose
}: {
    userId: string,
    asset: any,
    onClose: () => void
}) {
    const [triggerValue, setTriggerValue] = React.useState('');
    const [triggerType, setTriggerType] = React.useState<'PRICE_LIMIT' | 'SCHEDULED'>('PRICE_LIMIT');
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: async () => {
            const resp = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    asset_symbol: asset.symbol,
                    asset_name: asset.name,
                    asset_type: asset.type || asset.asset_type,
                    trigger_type: triggerType,
                    trigger_value: triggerValue
                }),
            });
            return resp.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            onClose();
        },
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-binance-surface border border-binance-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-binance-border bg-binance-surface/50">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-binance-brand" />
                        <h2 className="text-sm font-bold uppercase tracking-tight">Set Alert: {asset.symbol}</h2>
                    </div>
                    <button onClick={onClose} className="text-binance-secondary hover:text-binance-text transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* Toggle Type */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-binance-bg rounded-lg border border-binance-border">
                        <button
                            onClick={() => setTriggerType('PRICE_LIMIT')}
                            className={`py-2 text-[10px] font-bold rounded flex flex-col items-center gap-1 transition-all ${triggerType === 'PRICE_LIMIT' ? 'bg-binance-surface text-binance-brand shadow-sm' : 'text-binance-secondary'}`}
                        >
                            PRICE TARGET
                        </button>
                        <button
                            onClick={() => setTriggerType('SCHEDULED')}
                            className={`py-2 text-[10px] font-bold rounded flex flex-col items-center gap-1 transition-all ${triggerType === 'SCHEDULED' ? 'bg-binance-surface text-binance-brand shadow-sm' : 'text-binance-secondary'}`}
                        >
                            SCHEDULED (Daily)
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-binance-secondary uppercase tracking-widest pl-1">
                            {triggerType === 'PRICE_LIMIT' ? 'Trigger Price (₹/$)' : 'Daily Time (HH:MM)'}
                        </label>
                        <input
                            autoFocus
                            value={triggerValue}
                            onChange={(e) => setTriggerValue(e.target.value)}
                            placeholder={triggerType === 'PRICE_LIMIT' ? 'e.g. 64250.00' : 'e.g. 09:15'}
                            className="bg-binance-bg border border-binance-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-binance-brand transition-all font-mono"
                        />
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-binance-brand/5 border border-binance-brand/20 rounded-lg">
                        <Info className="w-4 h-4 text-binance-brand shrink-0 mt-0.5" />
                        <p className="text-[10px] text-binance-secondary leading-normal">
                            {triggerType === 'PRICE_LIMIT'
                                ? `An alert will be sent to your Telegram/WhatsApp when ${asset.symbol} crosses this price.`
                                : `You'll receive a daily summary of ${asset.symbol} at exactly this time.`
                            }
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-binance-bg/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded text-xs font-bold text-binance-secondary hover:bg-binance-border transition-colors border border-binance-border"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => addMutation.mutate()}
                        disabled={!triggerValue}
                        className="flex-[2] py-2 rounded text-xs font-bold bg-binance-brand text-black hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-binance-brand/10"
                    >
                        CREATE ALERT
                    </button>
                </div>
            </div>
        </div>
    );
}
