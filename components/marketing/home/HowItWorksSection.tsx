import { HOW_IT_WORKS_STEPS, type HowItWorksStep } from "./content";

function StepIcon({ icon }: { icon: HowItWorksStep["icon"] }) {
  if (icon === "message") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (icon === "search") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  if (icon === "clock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section">
      <div className="section-head">
        <div className="eyebrow">Setup in 3 minutes</div>
        <h2 className="s-h2">
          Stop watching charts.
          <br />
          Start acting on signals.
        </h2>
        <p className="s-sub">
          Most traders miss moves not from lack of skill but from being somewhere else when it happened.
          This fixes that.
        </p>
      </div>

      <div className="steps-grid">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <div className="step" key={step.id}>
            <div className="step-num">Step {step.id}</div>
            <div className="step-icon">
              <StepIcon icon={step.icon} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
