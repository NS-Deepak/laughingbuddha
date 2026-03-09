'use client';

export function PriceCell(params: any) {
    const price = params.value;
    if (price === undefined || price === null) return <span className="text-binance-secondary">N/A</span>;

    return (
        <span className="font-mono text-binance-text font-medium">
            {params.data.asset_type === 'CRYPTO' ? '$' : '₹'}
            {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );
}
