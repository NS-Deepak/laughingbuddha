import Link from "next/link";

interface HeroSectionProps {
  showDashboardButton: boolean;
  showAuthButtons: boolean;
}

export function HeroSection({ showDashboardButton, showAuthButtons }: HeroSectionProps) {
  return (
    <div className="hero-outer">
      <div className="hero-inner">
        <div>
          <div className="hero-label">
            <span className="live-dot"></span>
            NSE · BSE · Telegram Delivery
          </div>

          <h1 className="hero-h1">
            Insight Before
            <span className="h1-accent">the Move</span>
          </h1>

          <p className="hero-p">LaughingBuddha delivers the moment others chase</p>

          <div className="hero-actions">
            {showDashboardButton ? (
              <Link href="/dashboard" className="btn-hero-p">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Go to Dashboard
              </Link>
            ) : null}
            {showAuthButtons ? (
              <Link href="/sign-up" className="btn-hero-p">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Start Free - No Card Needed
              </Link>
            ) : null}
            <Link href="#how-it-works" className="btn-hero-s">
              How it Works
            </Link>
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
                <div className="a-chg c-dn">▼ -1.32%</div>
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
  );
}
