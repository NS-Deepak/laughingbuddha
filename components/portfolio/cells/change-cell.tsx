import { cn } from '@/lib/utils';

export function ChangeCell(params: any) {
    const change = params.value;
    if (change === undefined || change === null) return <span className="text-binance-secondary">--</span>;

    const isPositive = change >= 0;

    return (
        <div className="flex items-center h-full">
            <span className={cn(isPositive ? 'text-binance-up' : 'text-binance-down', "font-medium")}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
        </div>
    );
}
