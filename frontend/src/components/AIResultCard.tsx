import StatusBadge from "./StatusBadge";

interface AIResult {
  damage_location: string;
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Confidence Score
        </span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: getColor() }}>{score}%</span>
      </div>
      <div style={{
        height: "6px",
        background: "var(--surface-3)",
        borderRadius: "3px",
        overflow: "hidden",
        border: "1px solid var(--surface-2)",
      }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: `linear-gradient(90deg, ${getColor()} 0%, ${getColor()}dd 100%)`,
          borderRadius: "3px",
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px ${getColor()}40`,
        }} />
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "11px 0",
      borderBottom: "1px solid var(--surface-2)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "8px",
          background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--surface-3)",
        }}>
          <i className={`ti ${icon}`} style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }} />
        </div>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

export default function AIResultCard({ result, variant = "provider" }: Props) {
  const fraudColors: Record<string, { accent: string; bg: string }> = {
    Low: { accent: "#16A34A", bg: "#F0FDF4" },
    Medium: { accent: "#D97706", bg: "#FFFBEB" },
    High: { accent: "#DC2626", bg: "#FFF1F2" },
  };
  const fraud = fraudColors[result.fraud_risk] ?? { accent: "var(--brand-400)", bg: "var(--brand-50)" };

  return (
    <div style={{
      marginTop: "22px",
      background: "var(--surface-0)",
      border: "1.5px solid var(--surface-3)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      boxShadow: "var(--shadow-md)",
      transition: "all var(--transition)",
    }}
      className="animate-fadeInUp">
      {/* Card header */}
      <div style={{
        padding: "16px 20px",
        background: "linear-gradient(135deg, var(--brand-900) 0%, var(--brand-800) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1.5px solid rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <i className="ti ti-cpu" style={{ color: "rgba(255,255,255,0.8)", fontSize: "17px", fontWeight: 600 }} />
          </div>
          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            AI Analysis Result
          </span>
        </div>
        <div style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block", boxShadow: "0 0 0 2px rgba(34,197,94,0.3)" }} />
          GPT-4o Vision
        </div>
      </div>

      {/* Fraud risk banner for high/medium */}
      {(result.fraud_risk === "High" || result.fraud_risk === "Medium") && (
        <div style={{
          padding: "12px 20px",
          background: fraud.bg,
          borderBottom: `1.5px solid ${result.fraud_risk === "High" ? "var(--danger-border)" : "var(--warning-border)"}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <i className={`ti ${result.fraud_risk === "High" ? "ti-alert-triangle" : "ti-alert-circle"}`}
            style={{ color: fraud.accent, fontSize: "17px", fontWeight: 700, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: fraud.accent }}>
            {result.fraud_risk === "High"
              ? "Fraud Risk Detected – Manual review strongly recommended"
              : "Possible inconsistencies detected – Review carefully"}
          </span>
        </div>
      )}

      <div style={{ padding: "20px" }}>
        {/* Confidence meter */}
        <div style={{ marginBottom: "20px" }}>
          <ConfidenceMeter score={result.confidence_score} />
        </div>

        {/* Metadata grid */}
        <div style={{ marginBottom: "6px" }}>
          <MetaRow icon="ti-map-pin" label="Damage Location" value={result.damage_location} />
          <MetaRow icon="ti-alert-triangle" label="Severity" value={
            <span style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              background: result.severity === "Severe" || result.severity === "Total Loss"
                ? "var(--danger-bg)" : result.severity === "Moderate"
                  ? "var(--warning-bg)" : "var(--success-bg)",
              color: result.severity === "Severe" || result.severity === "Total Loss"
                ? "var(--danger-text)" : result.severity === "Moderate"
                  ? "var(--warning-text)" : "var(--success-text)",
              border: result.severity === "Severe" || result.severity === "Total Loss"
                ? "1px solid var(--danger-border)" : result.severity === "Moderate"
                  ? "1px solid var(--warning-border)" : "1px solid var(--success-border)",
            }}>
              {result.severity}
            </span>
          } />
          <MetaRow icon="ti-shield" label="Fraud Risk" value={<StatusBadge status={result.fraud_risk} size="sm" />} />
        </div>

        {/* Observations */}
        <div style={{
          marginTop: "18px",
          padding: "16px",
          background: "var(--surface-1)",
          borderRadius: "var(--radius-md)",
          border: "1.5px solid var(--surface-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{
              width: "32px", height: "32px",
              borderRadius: "8px",
              background: "var(--info-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid var(--info-border)",
            }}>
              <i className="ti ti-notes" style={{ fontSize: "14px", color: "var(--info-text)", fontWeight: 600 }} />
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI Observations
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {result.observations}
          </p>
        </div>

        {/* Recommended action */}
        <div style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--surface-1)",
          borderRadius: "var(--radius-md)",
          border: "1.5px solid var(--surface-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="ti ti-gavel" style={{ fontSize: "15px", color: "var(--text-muted)", fontWeight: 600 }} />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
              Recommended Action
            </span>
          </div>
          <StatusBadge status={result.recommended_action} />
        </div>

        {variant === "customer" && (
          <p style={{
            marginTop: "14px",
            fontSize: "12px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            lineHeight: 1.6,
            padding: "12px 14px",
            background: "var(--info-bg)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--info-border)",
          }}>
            <i className="ti ti-info-circle" style={{ fontSize: "14px", flexShrink: 0, marginTop: "2px", color: "var(--info-text)", fontWeight: 600 }} />
            <span>This is an AI-generated estimate for informational purposes only. The final decision rests with your insurer.</span>
          </p>
        )}
      </div>
    </div>
  );
}