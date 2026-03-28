import { ALERT_CHECKLIST } from "./content";

export function AlertPreviewSection() {
  return (
    <section className="section">
      <div className="preview-grid">
        <div>
          <div className="eyebrow">Alert design</div>
          <h2 className="s-h2">One message. Everything you need to act.</h2>
          <p className="s-sub">
            Generic apps send you a number. LaughingBuddha sends you a decision brief what moved, why the
            alert fired, and how strong the momentum is. Read it in four seconds. Know exactly what to do
            next.
          </p>
          <div className="check-list">
            {ALERT_CHECKLIST.map((item) => (
              <div className="check-row" key={item.id}>
                <div className="c-dot">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
                <div
                  className="c-text"
                  dangerouslySetInnerHTML={{
                    __html: item.text,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="tg-preview">
          <div className="tg-bar">
            <div className="term-dots">
              <div className="td td-r" />
              <div className="td td-y" />
              <div className="td td-g" />
            </div>
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
              <div className="msg-line">
                <span className="msg-sym">RELIANCE</span> crossed your target of ₹2,840.
              </div>
              <div className="msg-line">
                Now at <span className="msg-val mv-up">₹2,847.50</span> ·{" "}
                <span className="msg-val mv-up">▲ +1.24%</span> today
              </div>
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
              <div className="msg-line">
                <span className="msg-sym">WIPRO</span> fell below your level of ₹460.
              </div>
              <div className="msg-line">
                Now at <span className="msg-val mv-dn">₹456.75</span> ·{" "}
                <span className="msg-val mv-dn">▼ -1.32%</span> today
              </div>
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
              <div className="msg-line">
                <span className="msg-sym">TATAMOTORS</span> - your pre-close brief.
              </div>
              <div className="msg-line">
                Now at <span className="msg-val mv-br">₹932.45</span> ·{" "}
                <span className="msg-val mv-br">▲ +3.15%</span> today
              </div>
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
  );
}
