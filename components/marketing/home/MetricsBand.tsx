export function MetricsBand() {
  return (
    <div className="metrics-band">
      <div className="metrics-inner">
        <div className="metric">
          <div className="metric-num">
            &lt;<span className="mn-brand">2</span>
            <span className="mn-sec">s</span>
          </div>
          <div className="metric-label">Average Alert Latency</div>
        </div>
        <div className="metric">
          <div className="metric-num">
            99.<span className="mn-brand">9<span className="mn-sec">%</span></span>
          </div>
          <div className="metric-label">Alert Delivery Rate</div>
        </div>
        <div className="metric">
          <div className="metric-num metric-num-nse">
            NSE <span className="mn-sec">+</span> BSE
          </div>
          <div className="metric-label">Both Exchanges. Every Symbol.</div>
        </div>
      </div>
    </div>
  );
}
