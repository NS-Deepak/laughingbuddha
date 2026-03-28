import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="footer-in">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/laughingbuddha.png" alt="LaughingBuddha" className="w-8 h-8 rounded-md" />
              <span className="footer-wm">LaughingBuddha</span>
            </div>
            <p>
              Automated stock alerts on Telegram for Indian market traders. Built for speed, precision, and
              signal clarity.
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="#how-it-works">How it Works</Link>
              </li>
              <li>
                <Link href="#features">Features</Link>
              </li>
              <li>
                <Link href="#pricing">Pricing</Link>
              </li>
              <li>
                <Link href="#">Changelog</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="#">Documentation</Link>
              </li>
              <li>
                <Link href="#">Alert Examples</Link>
              </li>
              <li>
                <Link href="#">Blog</Link>
              </li>
              <li>
                <Link href="#">Status</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="#">About</Link>
              </li>
              <li>
                <Link href="#">Contact</Link>
              </li>
              <li>
                <Link href="https://twitter.com/LaughingBuddha">X (Twitter)</Link>
              </li>
              <li>
                <Link href="#">Telegram</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © 2026 LaughingBuddha. All rights reserved. Not SEBI registered. Not investment advice.
          </span>
          <div className="footer-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
