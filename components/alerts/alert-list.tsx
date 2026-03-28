'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Trash2, Clock, BarChart3 } from 'lucide-react';

export function AlertList({ userId }: { userId: string }) {
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ['alerts', userId],
        queryFn: async () => {
            const resp = await fetch(`/api/alerts?user_id=${userId}`);
            const data = await resp.json();
            // Backend might return { alerts: [...] } or direct array
            return Array.isArray(data) ? data : (data.alerts || []);
        },
    });

    const alerts = response || [];

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        },
    });

    if (isLoading) return <div className="p-4 text-center text-binance-secondary">Loading alerts...</div>;

    return (
        <div className="flex flex-col gap-2">
            {alerts?.length === 0 && (
                <div className="p-8 text-center border border-dashed border-binance-border rounded-lg">
                    <BellOff className="w-8 h-8 mx-auto text-binance-secondary mb-2 opacity-50" />
                    <p className="text-sm text-binance-secondary">No active alerts configured.</p>
                </div>
            )}

            {alerts?.map((alert: any) => (
                <div key={alert.id} className="bg-binance-surface border border-binance-border rounded-lg p-4 flex items-center justify-between group hover:border-binance-brand/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={alert.is_active ? 'text-binance-brand' : 'text-binance-secondary'}>
                            {alert.trigger_type === 'PRICE_LIMIT' ? <BarChart3 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm tracking-tight">{alert.asset_symbol}</span>
                                <span className="text-[10px] text-binance-secondary uppercase bg-binance-bg px-1.5 rounded border border-binance-border">{alert.asset_type}</span>
                            </div>
                            <p className="text-xs text-binance-secondary mt-0.5">
                                Target: <span className="text-binance-text font-medium">{alert.trigger_value}</span>
                                {alert.trigger_type === 'PRICE_LIMIT' && ' (Price)'}
                                {alert.trigger_type === 'SCHEDULED' && ' (Time)'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${alert.is_active ? 'bg-binance-up/10 text-binance-up border-binance-up/20' : 'bg-binance-secondary/10 text-binance-secondary border-binance-secondary/20'}`}>
                            {alert.is_active ? 'ACTIVE' : 'MUTED'}
                        </span>
                        <button
                            onClick={() => deleteMutation.mutate(alert.id)}
                            className="text-binance-secondary hover:text-binance-down opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
