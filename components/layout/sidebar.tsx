'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
    Bell,
    LayoutDashboard,
    User,
    ChevronLeft,
    ChevronRight,
    Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';

export function Sidebar() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebar();
    const { signOut } = useClerk();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Alerts',    icon: Bell,            href: '/dashboard/notifications' },
        { name: 'Account',   icon: User,            href: '/dashboard/profile' },
        { name: 'Plans',    icon: Crown,           href: '/dashboard/plans' },
    ];

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside
                className={cn(
                    'hidden md:flex flex-col h-screen fixed left-0 top-0 z-30',
                    'border-r border-binance-border bg-binance-surface',
                    'transition-[width] duration-200 ease-in-out overflow-hidden',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                {/* Logo + toggle */}
                <div className={cn(
                    'flex items-center h-16 border-b border-binance-border px-3 shrink-0',
                    collapsed ? 'justify-center' : 'justify-between'
                )}>
                    {!collapsed && (
                        <div className="flex items-center gap-2 min-w-0">
                            <img
                                src="/laughingbuddha.png"
                                alt="Logo"
                                className="w-7 h-7 rounded-md shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="text-xs font-black tracking-tighter text-binance-text uppercase italic truncate">
                                    Laughing Buddha
                                </p>
                                <p className="text-[9px] text-binance-brand font-bold tracking-widest uppercase">
                                    MARKET ALERTS
                                </p>
                            </div>
                        </div>
                    )}

                    {collapsed && (
                        <img
                            src="/laughingbuddha.png"
                            alt="Logo"
                            className="w-7 h-7 rounded-md"
                        />
                    )}

                    <button
                        onClick={toggle}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className={cn(
                            'p-1.5 rounded-md text-binance-secondary hover:text-binance-text hover:bg-binance-bg transition-colors shrink-0',
                            collapsed ? 'mt-0' : ''
                        )}
                    >
                        {collapsed
                            ? <ChevronRight className="w-4 h-4" />
                            : <ChevronLeft  className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-3 px-2 space-y-1 overflow-hidden">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={cn(
                                    'flex items-center rounded-lg text-sm font-medium transition-all group',
                                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                                    active
                                        ? 'bg-binance-brand text-black'
                                        : 'text-binance-secondary hover:text-binance-text hover:bg-binance-bg'
                                )}
                            >
                                <item.icon className={cn(
                                    'shrink-0',
                                    collapsed ? 'w-5 h-5' : 'w-4 h-4',
                                    active ? 'text-black' : 'text-binance-secondary group-hover:text-binance-brand'
                                )} />
                                {!collapsed && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign out */}
                <div className={cn(
                    'p-2 border-t border-binance-border shrink-0',
                )}>
                    <button
                        onClick={() => signOut({ redirectUrl: '/' })}
                        className={cn(
                            'flex items-center rounded-lg text-sm font-medium transition-all group w-full',
                            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                            'text-binance-secondary hover:text-red-500 hover:bg-red-500/10'
                        )}
                        title={collapsed ? 'Sign out' : undefined}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                        {!collapsed && <span>Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* ── Mobile Bottom Tab Bar ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-binance-surface border-t border-binance-border flex items-stretch">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-colors',
                            pathname === item.href
                                ? 'text-binance-brand'
                                : 'text-binance-secondary hover:text-binance-text'
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </>
    );
}
