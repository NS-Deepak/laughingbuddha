export function FeaturesSection() {
  return (
    <div id="features" className="features-band">
      <div className="section">
        <div className="section-head">
          <div className="eyebrow">One job. Done with precision.</div>
          <h2 className="s-h2">
            We do one thing.
            <br />
            We do it better than anything else.
          </h2>
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
            <p>
              The moment a stock on your list crosses a level you set, your Telegram buzzes. Not a minute
              later. Not after you refresh. The instant it happens, every minute the market is open.
            </p>
          </div>

          <div className="feat-card">
            <div className="feat-icon fi-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Scheduled Time Alerts</h3>
            <p>
              Build a trading routine without opening the app. Market open at 9:15 AM. Mid-session check
              at 12:30 PM. Pre-close brief at 3:15 PM. Set once, runs every session.
            </p>
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
            <p>
              Keep intraday picks, swing trades, and long-term holds separate. Different alert logic per
              list. Different timing per list. Your strategy, reflected in the tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
