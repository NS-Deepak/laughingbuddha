'use client';

import { cn } from "@/lib/utils";

export function BadgeCell(params: any) {
    const type = params.value;

    const styles: Record<string, string> = {
        'STOCK': 'bg-blue-900/30 text-blue-400 border-blue-800',
        'CRYPTO': 'bg-purple-900/30 text-purple-400 border-purple-800',
        'COMMODITY': 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
    };

    return (
        <div className="flex items-center h-full">
            <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold border rounded uppercase tracking-wider",
                styles[type] || 'bg-gray-800 text-gray-400'
            )}>
                {type}
            </span>
        </div>
    );
}
