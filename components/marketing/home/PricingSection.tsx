import { PRICING_PLANS } from "./content";

function FeatureIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <div className="pf-ic pfc-y">
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="2 5 4 7 8 3" />
        </svg>
      </div>
    );
  }

  return (
    <div className="pf-ic pfc-n">
      <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="2" x2="8" y2="8" />
        <line x1="8" y1="2" x2="2" y2="8" />
      </svg>
    </div>
  );
}

export function PricingSection() {
  return (
    <div id="pricing" className="pricing-band">
      <section className="section">
        <div className="section-head">
          <div className="eyebrow">Starts free. Stays honest.</div>
          <h2 className="s-h2">
            Pay for power
            <br />
            not for access.
          </h2>
          <p className="s-sub">
            The free plan is real not a trial, not crippled. Upgrade when your watchlist outgrows it.
          </p>
        </div>

        <div className="pricing-grid">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.tier} className={`plan${plan.className ? ` ${plan.className}` : ""}`}>
              {plan.badge ? <div className="pro-badge">{plan.badge}</div> : null}
              <div className="plan-tier">{plan.tier}</div>
              <div>
                <span className="plan-price">{plan.price}</span>
                <span className="plan-per">{plan.per}</span>
              </div>
              <div className="plan-tag">{plan.tag}</div>
              <div className="plan-rule"></div>
              <div className="plan-feats">
                {plan.features.map((feature) => (
                  <div key={feature.label} className={`pf ${feature.included ? "pf-y" : "pf-n"}`}>
                    <FeatureIcon included={feature.included} />
                    {feature.label}
                  </div>
                ))}
              </div>
              <button className={plan.ctaClassName}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
