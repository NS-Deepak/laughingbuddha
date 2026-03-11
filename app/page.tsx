import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { MobileNav } from '@/components/marketing/mobile-nav';
import './marketing.css';

export default function MarketingPage() {
  return (
    <div className="marketing-page">


      {/* ═══ NAV ═══ */}
      <nav className="marketing-nav">
        <Link href="/" className="nav-logo">
          <img src="/laughingbuddha.png" alt="LaughingBuddha" className="w-8 h-8 rounded-md" />
          <span className="nav-wordmark">LaughingBuddha</span>
        </Link>

        <div className="nav-links">
          <Link href="#how-it-works" className="nav-link">How it Works</Link>
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#pricing" className="nav-link">Pricing</Link>
        </div>

        <div className="nav-right">
          <SignedIn>
            <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>Go to Dashboard →</Link>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center' }}>Sign In</Link>
            <Link href="/sign-up" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>Start Free →</Link>
          </SignedOut>
          {/* Hamburger — visible only on ≤1024px via CSS */}
          <MobileNav />
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="hero-outer">
        <div className="hero-inner">
          {/* Left */}
          <div>
            <div className="hero-label">
              <span className="live-dot"></span>
              NSE · BSE · Telegram Delivery
            </div>

            <h1 className="hero-h1">
              Insight Before
              <span className="h1-accent">the Move</span>
            </h1>

            <p className="hero-p">
              LaughingBuddha delivers the moment others chase</p>

            <div className="hero-actions">
              <SignedIn>
                <Link href="/dashboard" className="btn-hero-p">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Go to Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <Link href="/sign-up" className="btn-hero-p">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Start Free — No Card Needed
                </Link>
              </SignedOut>
              <Link href="#how-it-works" className="btn-hero-s" style={{ display: 'inline-flex', alignItems: 'center' }}>Watch a Demo</Link>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <div className="trust-check">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <span className="trust-text">Under 2s alert latency</span>
              </div>
              <div className="trust-item">
                <div className="trust-check">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <span className="trust-text">NSE &amp; BSE supported</span>
              </div>
              <div className="trust-item">
                <div className="trust-check">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <span className="trust-text">Private Telegram channel</span>
              </div>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="terminal">
            <div className="term-bar">
              <div className="term-dots">
                <div className="td td-r"></div>
                <div className="td td-y"></div>
                <div className="td td-g"></div>
              </div>
              <span className="term-title">Alert Engine</span>
              <div className="term-live">
                <div className="term-live-dot"></div>
                Monitoring
              </div>
            </div>

            <div className="term-body">
              <div className="a-row r-up">
                <div className="a-icon ai-up">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div className="a-body">
                  <div className="a-sym">RELIANCE</div>
                  <div className="a-desc">Target ₹2,840 crossed · Alert sent</div>
                </div>
                <div className="a-price">
                  <div className="a-val">₹2,847.50</div>
                  <div className="a-chg c-up">▲ +1.24%</div>
                </div>
              </div>

              <div className="a-row r-dn">
                <div className="a-icon ai-dn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </svg>
                </div>
                <div className="a-body">
                  <div className="a-sym">WIPRO</div>
                  <div className="a-desc">Stop-loss ₹460 breached · Alert sent</div>
                </div>
                <div className="a-price">
                  <div className="a-val">₹456.75</div>
                  <div className="a-chg c-dn">▼ −1.32%</div>
                </div>
              </div>

              <div className="a-row r-br">
                <div className="a-icon ai-br">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="a-body">
                  <div className="a-sym">TATAMOTORS</div>
                  <div className="a-desc">Scheduled 3:00 PM close alert</div>
                </div>
                <div className="a-price">
                  <div className="a-val">₹932.45</div>
                  <div className="a-chg c-br">▲ +3.15%</div>
                </div>
              </div>

              <div className="term-status">
                <span className="ts-text">3 alerts fired today · 8 stocks monitored</span>
                <span className="ts-badge">0 missed</span>
              </div>
            </div>

            <div className="term-foot">
              <div className="tg-pill">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.2 5.3L18.7 19c-.3 1.1-1 1.4-2 .9l-4.4-3.2-2.1 2c-.2.2-.5.3-.8.3l.3-4.5 7.8-7.1c.3-.3 0-.5-.4-.2L5.9 12.7l-4.3-1.3c-1-.3-1-.9.2-1.4L20.7 3.9c.8-.3 1.5.2 1.5 1.4z" />
                </svg>
                <span>Telegram</span>
              </div>
              <span className="term-ts">09:17:43 IST · Market Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ METRICS BAND ═══ */}
      <div className="metrics-band">
        <div className="metrics-inner">
          <div className="metric">
            <div className="metric-num">&lt;<span className="mn-brand">2</span><span className="mn-sec">s</span></div>
            <div className="metric-label">Average Alert Latency</div>
          </div>
          <div className="metric">
            <div className="metric-num">99.<span className="mn-brand">9<span className="mn-sec">%</span></span></div>
            <div className="metric-label">Alert Delivery Rate</div>
          </div>
          <div className="metric">
            <div className="metric-num" style={{ fontSize: '26px', letterSpacing: 'var(--ls-tight)' }}>NSE <span className="mn-sec" style={{ fontSize: '16px' }}>+</span> BSE</div>
            <div className="metric-label">Both Exchanges. Every Symbol.</div>
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="section">
        <div className="section-head">
          <div className="eyebrow">Setup in 3 minutes</div>
          <h2 className="s-h2">Stop watching charts.<br />Start acting on signals.</h2>
          <p className="s-sub">Most traders miss moves not from lack of skill but from being somewhere else when it happened. This fixes that.</p>
        </div>

        <div className="steps-grid">
          <div className="step">
            <div className="step-num">Step 01</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Connect Telegram</h3>
            <p>Authorise in one click. A private channel is created exclusively for your alerts. No groups, no other users, no noise.</p>
          </div>
          <div className="step">
            <div className="step-num">Step 02</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>Add Your Stocks</h3>
            <p>Search any NSE or BSE symbol. Set a price target, a stop-loss, or a percentage threshold. Monitoring begins immediately.</p>
          </div>
          <div className="step">
            <div className="step-num">Step 03</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Schedule Your Alerts</h3>
            <p>A 9:15 AM market-open snapshot. A 3:00 PM pre-close brief. Schedule once, runs every trading session without touching the app.</p>
          </div>
          <div className="step">
            <div className="step-num">Step 04</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3>Act on the Signal</h3>
            <p>Symbol. Price. Change. Trigger reason. Everything to decide in four seconds. The signal that makes you faster than the trader next to you.</p>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <div id="features" className="features-band">
        <div className="section">
          <div className="section-head">
            <div className="eyebrow">One job. Done with precision.</div>
            <h2 className="s-h2">We do one thing.<br />We do it better than anything else.</h2>
          </div>

          <div className="features-grid">
            <div className="feat-card f-lead">
              <div className="feat-kicker">Core capability</div>
              <div className="feat-icon fi-gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Real-Time Price Alerts</h3>
              <p>The moment a stock on your list crosses a level you set, your Telegram buzzes. Not a minute later. Not after you refresh. The instant it happens, every minute the market is open.</p>
            </div>

            <div className="feat-card">
              <div className="feat-icon fi-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Scheduled Time Alerts</h3>
              <p>Build a trading routine without opening the app. Market open at 9:15 AM. Mid-session check at 12:30 PM. Pre-close brief at 3:15 PM. Set once, runs every session.</p>
            </div>

            <div className="feat-card">
              <div className="feat-icon fi-slate">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <h3>Organised Watchlists</h3>
              <p>Keep intraday picks, swing trades, and long-term holds separate. Different alert logic per list. Different timing per list. Your strategy, reflected in the tool.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ALERT PREVIEW ═══ */}
      <section className="section">
        <div className="preview-grid">
          <div>
            <div className="eyebrow">Alert design</div>
            <h2 className="s-h2">One message.<br />Everything you need to act.</h2>
            <p className="s-sub">Generic apps send you a number. LaughingBuddha sends you a decision brief what moved, why the alert fired, and how strong the momentum is. Read it in four seconds. Know exactly what to do next.</p>
            <div className="check-list">
              <div className="check-row">
                <div className="c-dot">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <div className="c-text"><strong>Symbol + live price</strong> - no need to open another app</div>
              </div>
              <div className="check-row">
                <div className="c-dot">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <div className="c-text"><strong>Trigger reason</strong> - target hit, stop-loss breached, or scheduled time</div>
              </div>
              <div className="check-row">
                <div className="c-dot">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <div className="c-text"><strong>Session % change</strong> - instant read on momentum direction</div>
              </div>
              <div className="check-row">
                <div className="c-dot">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <div className="c-text"><strong>Exact timestamp</strong> - know if it broke the level 10 seconds or 10 minutes ago</div>
              </div>
            </div>
          </div>

          <div className="tg-preview">
            <div className="tg-bar">
              <div className="tg-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.2 5.3L18.7 19c-.3 1.1-1 1.4-2 .9l-4.4-3.2-2.1 2c-.2.2-.5.3-.8.3l.3-4.5 7.8-7.1c.3-.3 0-.5-.4-.2L5.9 12.7l-4.3-1.3c-1-.3-1-.9.2-1.4L20.7 3.9c.8-.3 1.5.2 1.5 1.4z" />
                </svg>
              </div>
              <div>
                <div className="tg-bar-name">LaughingBuddha Alerts</div>
                <div className="tg-bar-sub">Private Channel · Your Stocks Only</div>
              </div>
            </div>
            <div className="tg-msgs">
              <div className="tg-msg m-up">
                <div className="msg-type mt-up">Target Hit</div>
                <div className="msg-line"><span className="msg-sym">RELIANCE</span> crossed your target of ₹2,840.</div>
                <div className="msg-line">Now at <span className="msg-val mv-up">₹2,847.50</span> · <span className="msg-val mv-up">▲ +1.24%</span> today</div>
                <div className="msg-line msg-ts">Triggered 09:28:14 IST</div>
                <div className="msg-tail">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Delivered
                </div>
              </div>
              <div className="tg-msg m-dn">
                <div className="msg-type mt-dn">Stop-Loss Breached</div>
                <div className="msg-line"><span className="msg-sym">WIPRO</span> fell below your level of ₹460.</div>
                <div className="msg-line">Now at <span className="msg-val mv-dn">₹456.75</span> · <span className="msg-val mv-dn">▼ −1.32%</span> today</div>
                <div className="msg-line msg-ts">Triggered 10:45:02 IST · 3 min ago</div>
                <div className="msg-tail">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Delivered
                </div>
              </div>
              <div className="tg-msg m-br">
                <div className="msg-type mt-br">Scheduled · 3:00 PM</div>
                <div className="msg-line"><span className="msg-sym">TATAMOTORS</span> - your pre-close brief.</div>
                <div className="msg-line">Now at <span className="msg-val mv-br">₹932.45</span> · <span className="msg-val mv-br">▲ +3.15%</span> today</div>
                <div className="msg-line msg-ts">Near 52W high · 15:00:00 IST</div>
                <div className="msg-tail">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Delivered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <div id="pricing" className="pricing-band">
        <section className="section">
          <div className="section-head">
            <div className="eyebrow">Starts free. Stays honest.</div>
            <h2 className="s-h2">Pay for power<br />not for access.</h2>
            <p className="s-sub">The free plan is real not a trial, not crippled. Upgrade when your watchlist outgrows it.</p>
          </div>

          <div className="pricing-grid">
            <div className="plan">
              <div className="plan-tier">Free</div>
              <div><span className="plan-price">₹0</span><span className="plan-per">/month</span></div>
              <div className="plan-tag">The full alert experience for five stocks. Free, with no expiry.</div>
              <div className="plan-rule"></div>
              <div className="plan-feats">
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Up to 5 stocks
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  5 alerts per day
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Price target alerts
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Private Telegram channel
                </div>
                <div className="pf pf-n">
                  <div className="pf-ic pfc-n">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="2" y1="2" x2="8" y2="8" />
                      <line x1="8" y1="2" x2="2" y2="8" />
                    </svg>
                  </div>
                  Scheduled time alerts
                </div>
                <div className="pf pf-n">
                  <div className="pf-ic pfc-n">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="2" y1="2" x2="8" y2="8" />
                      <line x1="8" y1="2" x2="2" y2="8" />
                    </svg>
                  </div>
                  Multiple watchlists
                </div>
              </div>
              <button className="btn-plan bp-out">Start Free — No Card</button>
            </div>

            <div className="plan is-pro">
              <div className="pro-badge">Most Popular</div>
              <div className="plan-tier">Pro</div>
              <div><span className="plan-price">₹299</span><span className="plan-per">/month</span></div>
              <div className="plan-tag">For active traders who need unlimited alerts, scheduling, and no daily limits.</div>
              <div className="plan-rule"></div>
              <div className="plan-feats">
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Up to 50 stocks
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Unlimited alerts
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Target + Stop-loss alerts
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Scheduled time alerts
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  5 watchlists
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Percentage move alerts
                </div>
              </div>
              <button className="btn-plan bp-brand">Start Pro — ₹299/month</button>
            </div>

            <div className="plan">
              <div className="plan-tier">Professional</div>
              <div><span className="plan-price">₹799</span><span className="plan-per">/month</span></div>
              <div className="plan-tag">For full-time traders running large, complex watchlists every session.</div>
              <div className="plan-rule"></div>
              <div className="plan-feats">
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Unlimited stocks
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Unlimited alerts
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  All Pro features
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Unlimited watchlists
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Priority alert delivery
                </div>
                <div className="pf pf-y">
                  <div className="pf-ic pfc-y">
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 5 4 7 8 3" />
                    </svg>
                  </div>
                  Early feature access
                </div>
              </div>
              <button className="btn-plan bp-out">Start Professional</button>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ FINAL CTA ═══ */}
      <div className="cta-band">
        <div className="cta-inner">
          <div className="eyebrow" style={{ marginBottom: '18px' }}>Get started today</div>
          <h2 className="cta-h2">
            The market opens at 9:15<br />
            <span className="ca">Be ready before it does.</span>
          </h2>
          <p className="cta-p">Set up in 3 minutes. First alert arrives before the opening bell. No card needed to start.</p>
          <div className="cta-row">
            <SignedIn>
              <Link href="/dashboard" className="btn-hero-p">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Go to Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-up" className="btn-hero-p">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Start Free — No Card Needed
              </Link>
            </SignedOut>
            <Link href="#how-it-works" className="btn-hero-s" style={{ display: 'inline-flex', alignItems: 'center' }}>See How It Works</Link>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="marketing-footer">
        <div className="footer-in">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/laughingbuddha.png" alt="LaughingBuddha" className="w-8 h-8 rounded-md" />
                <span className="footer-wm">LaughingBuddha</span>
              </div>
              <p>Automated stock alerts on Telegram for Indian market traders. Built for speed, precision, and signal clarity.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link href="#how-it-works">How it Works</Link></li>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#">Changelog</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><Link href="#">Documentation</Link></li>
                <li><Link href="#">Alert Examples</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Status</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Contact</Link></li>
                <li><Link href="https://twitter.com/LaughingBuddha">X (Twitter)</Link></li>
                <li><Link href="#">Telegram</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 LaughingBuddha. All rights reserved. Not SEBI registered. Not investment advice.</span>
            <div className="footer-legal">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
