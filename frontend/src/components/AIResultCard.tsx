import type { AIResult } from "../types/claim.types";
import StatusBadge from "./StatusBadge";

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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Confidence Score
        </span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: getColor() }}>{score}%</span>
      </div>
      <div style={{
        height: "5px",
        background: "var(--surface-3)",
        borderRadius: "3px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: getColor(),
          borderRadius: "3px",
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
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
      padding: "9px 0",
      borderBottom: "1px solid var(--surface-2)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "26px", height: "26px",
          borderRadius: "6px",
          background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`ti ${icon}`} style={{ fontSize: "13px", color: "var(--text-secondary)" }} />
        </div>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{value}</div>
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
      marginTop: "20px",
      background: "var(--surface-0)",
      border: "1.5px solid var(--surface-3)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}
      className="animate-fadeInUp">
      {/* Card header */}
      <div style={{
        padding: "14px 18px",
        background: "var(--brand-900)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="ti ti-cpu" style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px" }} />
          <span style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            AI Analysis Result
          </span>
        </div>
        <div style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          GPT-4o Vision
        </div>
      </div>

      {/* Fraud risk banner for high/medium */}
      {(result.fraud_risk === "High" || result.fraud_risk === "Medium") && (
        <div style={{
          padding: "10px 18px",
          background: fraud.bg,
          borderBottom: `1px solid ${result.fraud_risk === "High" ? "var(--danger-border)" : "var(--warning-border)"}`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <i className={`ti ${result.fraud_risk === "High" ? "ti-alert-triangle" : "ti-alert-circle"}`}
            style={{ color: fraud.accent, fontSize: "15px" }} />
          <span style={{ fontSize: "13px", fontWeight: 500, color: fraud.accent }}>
            {result.fraud_risk === "High"
              ? "Fraud Risk Detected â€” Manual review strongly recommended"
              : "Possible inconsistencies detected â€” Review carefully"}
          </span>
        </div>
      )}

      <div style={{ padding: "16px 18px" }}>
        {/* Confidence meter */}
        <div style={{ marginBottom: "16px" }}>
          <ConfidenceMeter score={result.confidence_score} />
        </div>

        {/* Metadata grid */}
        <div style={{ marginBottom: "4px" }}>
          <MetaRow icon="ti-map-pin" label="Damage Location" value={result.damage_location} />
          <MetaRow icon="ti-alert-triangle" label="Severity" value={
            <span style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              background: result.severity === "Severe" || result.severity === "Total Loss"
                ? "var(--danger-bg)" : result.severity === "Moderate"
                  ? "var(--warning-bg)" : "var(--success-bg)",
              color: result.severity === "Severe" || result.severity === "Total Loss"
                ? "var(--danger-text)" : result.severity === "Moderate"
                  ? "var(--warning-text)" : "var(--success-text)",
            }}>
              {result.severity}
            </span>
          } />
          <MetaRow icon="ti-shield" label="Fraud Risk" value={<StatusBadge status={result.fraud_risk} size="sm" />} />
        </div>

        {/* Observations */}
        <div style={{
          marginTop: "14px",
          padding: "14px",
          background: "var(--surface-1)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--surface-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <i className="ti ti-notes" style={{ fontSize: "13px", color: "var(--text-muted)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AI Observations
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
            {result.observations}
          </p>
        </div>

        {/* Recommended action */}
        <div style={{
          marginTop: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "var(--surface-1)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--surface-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="ti ti-gavel" style={{ fontSize: "14px", color: "var(--text-muted)" }} />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 400 }}>
              {variant === "customer" ? "Estimated outcome" : "AI Recommended Action"}
            </span>
          </div>
          <StatusBadge status={result.recommended_action} />
        </div>

        {variant === "customer" && (
          <p style={{
            marginTop: "12px",
            fontSize: "11.5px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "flex-start",
            gap: "5px",
            lineHeight: 1.5,
          }}>
            <i className="ti ti-info-circle" style={{ fontSize: "13px", flexShrink: 0, marginTop: "1px" }} />
            This is an AI-generated estimate for informational purposes only. The final decision rests with your insurer.
          </p>
        )}
      </div>
    </div>
  );
}
