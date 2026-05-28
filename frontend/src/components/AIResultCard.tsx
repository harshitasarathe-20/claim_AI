import StatusBadge from "./StatusBadge";
import DamageLocationVisual from "./DamageLocationVisual";

interface AIResult {
  damage_location: string;
  impact_direction?: string;
  collision_type?: string;
  severity: string;
  fraud_risk: "Low" | "Medium" | "High";
  confidence_score: number;
  observations: string;
  recommended_action: "Approve" | "Investigate" | "Reject";
}

interface Props {
  result: AIResult;
  variant?: "customer" | "provider";
}

function ConfidenceMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "#16A34A";
    if (score >= 60) return "#D97706";
    return "#DC2626";
  };

  const colorClass = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

  return (
    <div className="ai-result-meter">
      <div className="ai-result-meter-label">
        <span className="ai-result-meter-title">Confidence Score</span>
        <span className={`ai-result-meter-value ${colorClass}`}>{score}%</span>
      </div>
      <div className="ai-result-meter-bar">
        <div
          className="ai-result-meter-fill"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${getColor()} 0%, ${getColor()}dd 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="ai-result-meta-row">
      <div className="ai-result-meta-label">
        <div className="ai-result-meta-icon">
          <i className={`ti ${icon}`} />
        </div>
        <span className="ai-result-meta-text">{label}</span>
      </div>
      <div className="ai-result-meta-value">{value}</div>
    </div>
  );
}

export default function AIResultCard({ result, variant = "provider" }: Props) {
  return (
    <div className="ai-result-card animate-fadeInUp">
      {/* Header */}
      <div className="ai-result-header">
        <div className="ai-result-title">
          <div className="ai-result-icon">
            <i className="ti ti-cpu" />
          </div>
          <span className="ai-result-text">AI Analysis Result</span>
        </div>
        <div className="ai-result-engine">
          <span className="ai-result-engine-dot" />
          Gemini 2.5 Flash Vision
        </div>
      </div>

      {/* Alert */}
      {(result.fraud_risk === "High" || result.fraud_risk === "Medium") && (
        <div className={`ai-result-alert ${result.fraud_risk === "Medium" ? "warning" : ""}`}>
          <i className={`ti ${result.fraud_risk === "High" ? "ti-alert-triangle" : "ti-alert-circle"} ai-result-alert-icon`} />
          <span className="ai-result-alert-text">
            {result.fraud_risk === "High"
              ? "Fraud Risk Detected – Manual review strongly recommended"
              : "Possible inconsistencies detected – Review carefully"}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="ai-result-content">
        {/* Confidence meter */}
        <ConfidenceMeter score={result.confidence_score} />

        {/* Damage Location Visual */}
        <div className="ai-result-damage-visual">
          <DamageLocationVisual damageLocation={result.damage_location} />
        </div>

        {/* Comprehensive Analysis Grid */}
        <div className="ai-result-analysis-grid">
          {/* Column 1: Damage Details */}
          <div className="ai-result-column">
            <h3 className="ai-result-section-title">Damage Analysis</h3>
            <div className="ai-result-meta">
              <MetaRow icon="ti-alert-triangle" label="Severity" value={
                <span style={{
                  padding: "0.25rem 0.625rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background:
                    result.severity === "Severe" || result.severity === "Total Loss"
                      ? "var(--danger-bg)"
                      : result.severity === "Moderate"
                        ? "var(--warning-bg)"
                        : "var(--success-bg)",
                  color:
                    result.severity === "Severe" || result.severity === "Total Loss"
                      ? "var(--danger-text)"
                      : result.severity === "Moderate"
                        ? "var(--warning-text)"
                        : "var(--success-text)",
                  border:
                    result.severity === "Severe" || result.severity === "Total Loss"
                      ? "1px solid var(--danger-border)"
                      : result.severity === "Moderate"
                        ? "1px solid var(--warning-border)"
                        : "1px solid var(--success-border)",
                }}>
                {result.severity}
              </span>
              } />
              {result.impact_direction && result.impact_direction !== "Unknown" && (
                <MetaRow icon="ti-arrow-up-right" label="Impact Direction" value={result.impact_direction} />
              )}
              {result.collision_type && result.collision_type !== "Unknown" && (
                <MetaRow icon="ti-car" label="Collision Type" value={result.collision_type} />
              )}
            </div>
          </div>

          {/* Column 2: Risk Assessment */}
          <div className="ai-result-column">
            <h3 className="ai-result-section-title">Risk Assessment</h3>
            <div className="ai-result-meta">
              <MetaRow icon="ti-shield" label="Fraud Risk" value={<StatusBadge status={result.fraud_risk} size="sm" />} />
            </div>
          </div>
        </div>

        {/* Observations */}
        <div className="ai-result-observations">
          <div className="ai-result-observations-title">
            <div className="ai-result-observations-icon">
              <i className="ti ti-notes" />
            </div>
            <span className="ai-result-observations-label">AI Observations & Analysis</span>
          </div>
          <p className="ai-result-observations-text">{result.observations}</p>
        </div>

        {/* Recommended action */}
        <div className="ai-result-action">
          <div className="ai-result-action-label">
            <i className="ti ti-gavel ai-result-action-icon" />
            <span className="ai-result-action-text">Recommended Action</span>
          </div>
          <StatusBadge status={result.recommended_action} />
        </div>

        {/* Final Recommendation Summary */}
        <div className="ai-result-summary">
          <div className="ai-result-summary-title">
            <i className="ti ti-checklist ai-result-summary-icon" />
            <span>Summary & Final Decision</span>
          </div>
          <p className="ai-result-summary-text">
            Based on comprehensive AI analysis: {result.severity.toLowerCase()} damage detected at {result.damage_location}.
            Confidence level: {result.confidence_score}%. 
            {result.fraud_risk === "High" ? " High fraud risk detected - requires immediate investigation." : 
             result.fraud_risk === "Medium" ? " Moderate fraud risk - recommend careful review." :
             " Low fraud risk - claim appears legitimate."}
            Recommended action: <strong>{result.recommended_action}</strong>.
          </p>
        </div>

        {/* Disclaimer */}
        {variant === "customer" && (
          <div className="ai-result-disclaimer">
            <i className="ti ti-info-circle ai-result-disclaimer-icon" />
            <span>This is an AI-generated estimate for informational purposes only. The final decision rests with your insurer.</span>
          </div>
        )}
      </div>
    </div>
  );
}