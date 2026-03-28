'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Menu, X, LayoutDashboard, Bell, User } from 'lucide-react';
import Link from 'next/link';

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();
    const { signOut } = useClerk();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Alerts', icon: Bell, href: '/dashboard/notifications' },
        { name: 'Account', icon: User, href: '/dashboard/profile' },
    ];

    const handleNavClick = () => setIsOpen(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    const handleSignOut = () => {
        setIsOpen(false);
        signOut({ redirectUrl: '/' });
    };

    return (
        <>
            {/* Header */}
            <header className="md:hidden sticky top-0 z-40 bg-binance-surface border-b border-binance-border h-16 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <img src="/laughingbuddha.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                    <span className="font-black text-sm uppercase italic tracking-tighter text-binance-text">
                        Laughing Buddha
                    </span>
                </Link>

                <button
                    onClick={toggleMenu}
                    className="p-2 text-binance-secondary hover:text-binance-text transition-colors"
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-binance-bg flex flex-col p-6 overflow-y-auto"
                    style={{ top: '64px', height: 'calc(100vh - 64px)' }}
                >
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
                                onClick={handleNavClick}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-binance-surface text-binance-text hover:text-binance-brand transition-all font-medium"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-binance-border">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium w-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
