'use client';

// Currency symbol based on Yahoo Finance currency
function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'GBP': return '£';
    case 'KRW': return '₩';
    case 'RUB': return '₽';
    case 'BRL': return 'R$';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    default: return '$';
  }
}

export function PriceCell(params: any) {
    const price = params.value;
    const currency = params.data?.currency || 'USD';
    const symbol = getCurrencySymbol(currency);
    
    if (price === undefined || price === null) return <span className="text-binance-secondary">N/A</span>;

    return (
        <span className="font-mono text-binance-text font-medium">
            {symbol}{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );
}
