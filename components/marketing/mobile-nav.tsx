'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const { isSignedIn, isLoaded } = useAuth();

    // Fallback: show both buttons while auth is loading
    const showBothButtons = !isLoaded;

    return (
        <>
            {/* Hamburger button — only visible at ≤1024px via CSS */}
            <button
                className="nav-hamburger"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
            >
                <span />
                <span />
                <span />
            </button>

            {/* Full-screen mobile overlay */}
            <div className={`mobile-menu${open ? ' is-open' : ''}`}>
                <button
                    className="mobile-menu-close"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                >
                    ✕
                </button>

                <Link href="#how-it-works" onClick={() => setOpen(false)}>How it Works</Link>
                <Link href="#features"     onClick={() => setOpen(false)}>Features</Link>
                <Link href="#pricing"      onClick={() => setOpen(false)}>Pricing</Link>

                <div className="mobile-menu-cta">
                    {!isLoaded || isSignedIn ? (
                        <Link href="/dashboard" className="btn-primary" onClick={() => setOpen(false)}>
                            Go to Dashboard →
                        </Link>
                    ) : null}
                    
                    {!isLoaded || !isSignedIn ? (
                        <>
                            <Link href="/sign-in" className="btn-ghost" onClick={() => setOpen(false)}>
                                Sign In
                            </Link>
                            <Link href="/sign-up" className="btn-primary" onClick={() => setOpen(false)}>
                                Start Free →
                            </Link>
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
