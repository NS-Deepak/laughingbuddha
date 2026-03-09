'use client';

export function ChangeCell(params: any) {
    const change = params.value;
    if (change === undefined || change === null) return <span className="text-binance-secondary">--</span>;

    const isPositive = change >= 0;

    return (
        <span className={isPositive ? 'text-binance-up' : 'text-binance-down'}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
    );
}
