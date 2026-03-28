import Link from "next/link";
import { MobileNav } from "@/components/marketing/mobile-nav";

interface MarketingNavProps {
  showDashboardButton: boolean;
  showAuthButtons: boolean;
}

export function MarketingNav({
  showDashboardButton,
  showAuthButtons,
}: MarketingNavProps) {
  return (
    <nav className="marketing-nav">
      <Link href="/" className="nav-logo">
        <img src="/laughingbuddha.png" alt="LaughingBuddha" className="w-8 h-8 rounded-md" />
        <span className="nav-wordmark">LaughingBuddha</span>
      </Link>

      <div className="nav-links desktop-only">
        <Link href="#how-it-works" className="nav-link">
          How it Works
        </Link>
        <Link href="#features" className="nav-link">
          Features
        </Link>
        <Link href="#pricing" className="nav-link">
          Pricing
        </Link>
      </div>

      <div className="nav-right">
        {showDashboardButton ? (
          <Link href="/dashboard" className="btn-primary desktop-only">
            Go to Dashboard →
          </Link>
        ) : null}
        {showAuthButtons ? (
          <div className="desktop-only flex items-center gap-2">
            <Link href="/sign-in" className="btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Start Free →
            </Link>
          </div>
        ) : null}
        {showAuthButtons ? (
          <Link href="/sign-in" className="btn-ghost mobile-only">
            Sign In
          </Link>
        ) : null}
        <MobileNav />
      </div>
    </nav>
  );
}
