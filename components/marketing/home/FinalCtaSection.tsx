import Link from "next/link";

interface FinalCtaSectionProps {
  showDashboardButton: boolean;
  showAuthButtons: boolean;
}

export function FinalCtaSection({ showDashboardButton, showAuthButtons }: FinalCtaSectionProps) {
  return (
    <div className="cta-band">
      <div className="cta-inner">
        <div className="eyebrow">Get started today</div>
        <h2 className="cta-h2">
          The market opens at 9:15
          <br />
          <span className="ca">Be ready before it does.</span>
        </h2>
        <p className="cta-p">Set up in 3 minutes. First alert arrives before the opening bell. No card needed to start.</p>
        <div className="cta-row">
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
      </div>
    </div>
  );
}
