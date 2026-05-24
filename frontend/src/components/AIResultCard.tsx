import type { AIResult } from "../types/claim.types";
import StatusBadge from "./StatusBadge";

interface Props {
  result: AIResult;
}

const row = (label: string, value: React.ReactNode) => (
  <div>
    <p style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "3px" }}>{label}</p>
    <div style={{ fontSize: "14px", fontWeight: 500, color: "#1E293B" }}>{value}</div>
  </div>
);

export default function AIResultCard({ result }: Props) {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px 18px",
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "#64748B",
          marginBottom: "14px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        AI Analysis
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {row("Damage location", result.damage_location)}
        {row("Severity", result.severity)}
        {row("Fraud risk", <StatusBadge status={result.fraud_risk} />)}
        {row("Confidence", `${result.confidence_score}%`)}
      </div>

      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px" }}>
          Observations
        </p>
        <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
          {result.observations}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <p style={{ fontSize: "12px", color: "#64748B" }}>Recommended action:</p>
        <StatusBadge status={result.recommended_action} />
      </div>
    </div>
  );
}