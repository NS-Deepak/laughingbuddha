'use client';

import { useState } from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Menu, X, LogOut, LayoutDashboard, Zap, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Terminal', icon: Zap, href: '/terminal/BTC-USD' },
        { name: 'Alerts', icon: Bell, href: '/dashboard/notifications' },
        { name: 'Account', icon: User, href: '/dashboard/profile' },
    ];

    return (
        <header className="md:hidden sticky top-0 z-40 bg-binance-surface border-b border-binance-border h-16 flex items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
                <img src="/laughingbuddha.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                <span className="font-black text-sm uppercase italic tracking-tighter text-binance-text">
                    Laughing Buddha
                </span>
            </Link>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-binance-secondary hover:text-binance-text transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 top-16 z-50 bg-binance-bg flex flex-col p-6 animate-in slide-in-from-top duration-200">
                    <div className="flex items-center gap-4 mb-8 p-4 bg-binance-surface rounded-xl border border-binance-border">
                        <div className="w-12 h-12 rounded-full bg-binance-brand/20 flex items-center justify-center border border-binance-brand/30">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="Profile" className="w-full h-full rounded-full" />
                            ) : (
                                <User className="w-6 h-6 text-binance-brand" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-binance-text">{user?.fullName || 'User'}</p>
                            <p className="text-xs text-binance-secondary">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-binance-surface text-binance-text hover:text-binance-brand transition-all font-medium"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-binance-border">
                        <div className="flex items-center gap-4 p-4 rounded-xl text-binance-down hover:bg-red-500/10 transition-all font-medium cursor-pointer">
                            <LogOut className="w-5 h-5" />
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
