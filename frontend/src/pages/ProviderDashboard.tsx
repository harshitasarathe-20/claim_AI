import { useState, useEffect } from "react";
import { fetchClaims, updateAction } from "../api/claimApi";
import type { Claim } from "../types/claim.types";
import StatusBadge from "../components/StatusBadge";
import AIResultCard from "../components/AIResultCard";

export default function ProviderDashboard() {
  const [claims, setClaims]       = useState<Claim[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [acting, setActing]       = useState<string | null>(null);
  const [error, setError]         = useState("");

  const load = async () => {
    setError("");
    try {
      const data = await fetchClaims();
      setClaims(data.reverse());
    } catch {
      setError("Could not load claims. Is the backend running on localhost:8000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (claimId: string, action: string) => {
    setActing(claimId);
    try {
      await updateAction(claimId, action);
      await load();
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setActing(null);
    }
  };

  const actionBtn = (
    claimId: string,
    label: string,
    action: string,
    bg: string,
    color: string,
    border: string
  ) => (
    <button
      disabled={acting === claimId}
      onClick={() => handleAction(claimId, action)}
      style={{
        padding: "6px 16px",
        background: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: "7px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: acting === claimId ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px" }}>
        <p style={{ color: "#6B7280", fontSize: "14px" }}>Loading claims...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
            Claims dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            {claims.length} claim{claims.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={load}
          style={{
            padding: "8px 16px",
            background: "#fff",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
            color: "#374151",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#991B1B",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {claims.length === 0 && !error && (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            border: "1px dashed #D1D5DB",
            borderRadius: "10px",
          }}
        >
          <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
            No claims yet. Submit one from the Customer Portal.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {claims.map((claim) => (
          <div
            key={claim.id}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {/* Header row — click to expand */}
            <div
              onClick={() =>
                setExpanded(expanded === claim.id ? null : claim.id)
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#4338CA",
                    flexShrink: 0,
                  }}
                >
                  {claim.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "#111827",
                      marginBottom: "2px",
                    }}
                  >
                    {claim.customer_name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    ₹{Number(claim.claim_amount).toLocaleString("en-IN")} &nbsp;·&nbsp;{" "}
                    {new Date(claim.submitted_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <StatusBadge status={claim.status} />
                {claim.ai_result && (
                  <StatusBadge status={claim.ai_result.fraud_risk} />
                )}
                <span style={{ color: "#9CA3AF", fontSize: "12px", marginLeft: "4px" }}>
                  {expanded === claim.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {/* Expanded detail panel */}
            {expanded === claim.id && (
              <div
                style={{
                  padding: "0 20px 20px",
                  borderTop: "1px solid #F3F4F6",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94A3B8",
                    marginTop: "14px",
                    marginBottom: "4px",
                  }}
                >
                  DAMAGE DESCRIPTION
                </p>
                <p style={{ fontSize: "14px", color: "#1F2937", lineHeight: 1.6 }}>
                  {claim.damage_desc}
                </p>

                {claim.ai_result && <AIResultCard result={claim.ai_result} />}

                {claim.status === "ANALYSED" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "18px",
                      paddingTop: "16px",
                      borderTop: "1px solid #F1F5F9",
                    }}
                  >
                    {actionBtn(claim.id, "✓ Approve", "APPROVED", "#DCFCE7", "#166534", "#86EFAC")}
                    {actionBtn(claim.id, "✗ Reject",  "REJECTED", "#FEE2E2", "#991B1B", "#FCA5A5")}
                  </div>
                )}

                {(claim.status === "APPROVED" || claim.status === "REJECTED") && (
                  <p
                    style={{
                      marginTop: "14px",
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    Final decision recorded:{" "}
                    <strong>{claim.status}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}