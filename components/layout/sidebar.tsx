'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bell,
    LayoutDashboard,
    Zap,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignOutButton } from "@clerk/nextjs";
import { useSidebar } from './sidebar-context';

export function Sidebar() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebar();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Terminal',  icon: Zap,             href: '/terminal/BTC-USD' },
        { name: 'Alerts',    icon: Bell,            href: '/dashboard/notifications' },
        { name: 'Account',   icon: User,            href: '/dashboard/profile' },
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
                                    PRO TERMINAL
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
                    <div
                        className={cn(
                            'flex items-center rounded-lg text-sm font-medium text-binance-secondary hover:text-binance-down transition-colors cursor-pointer',
                            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                        )}
                        title={collapsed ? 'Sign out' : undefined}
                    >
                        <LogOut className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                        {!collapsed && <SignOutButton />}
                    </div>
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
