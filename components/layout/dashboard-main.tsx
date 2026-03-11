'use client';

import { ReactNode } from 'react';
import { useSidebar } from './sidebar-context';
import { cn } from '@/lib/utils';

export function DashboardMain({ children }: { children: ReactNode }) {
    const { collapsed } = useSidebar();

    return (
        <main
            className={cn(
                'flex-1 transition-[margin] duration-200 ease-in-out md:pt-0 pb-20 md:pb-0',
                // Mobile: no offset (sidebar hidden, bottom tab bar shown)
                // Desktop: offset matches sidebar width
                collapsed ? 'md:ml-16' : 'md:ml-64'
            )}
        >
            {children}
        </main>
    );
}
