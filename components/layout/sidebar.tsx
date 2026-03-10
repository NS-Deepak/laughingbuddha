'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bell,
    LayoutDashboard,
    Zap,
    User,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignOutButton } from "@clerk/nextjs";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Terminal', icon: Zap, href: '/terminal/BTC-USD' },
        { name: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
    ];

    return (
        <aside className="w-64 border-r border-binance-border bg-binance-surface flex flex-col h-screen fixed left-0 top-0 z-30">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-binance-brand rounded-lg flex items-center justify-center shadow-lg shadow-binance-brand/20">
                        <span className="text-black font-black text-xl italic">LB</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tighter text-binance-text uppercase italic">Laughing Buddha</h1>
                        <p className="text-[10px] text-binance-brand font-bold tracking-widest uppercase">PRO TERMINAL</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                            pathname === item.href
                                ? "bg-binance-brand text-black"
                                : "text-binance-secondary hover:text-binance-text hover:bg-binance-bg"
                        )}
                    >
                        <item.icon className={cn(
                            "w-4 h-4",
                            pathname === item.href ? "text-black" : "text-binance-secondary group-hover:text-binance-brand"
                        )} />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-binance-border space-y-2">
                <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-binance-secondary hover:text-binance-text transition-colors"
                >
                    <User className="w-4 h-4" />
                    Account
                </Link>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-binance-secondary hover:text-binance-down transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <SignOutButton />
                </div>
            </div>
        </aside>
    );
}
