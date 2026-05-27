import { useState, useEffect } from "react";
import { fetchClaims, updateAction } from "../api/claimApi";
import type { Claim } from "../types/claim.types";
import StatusBadge from "../components/StatusBadge";
import AIResultCard from "../components/AIResultCard";

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number; accent: string }) {
  return (
    <div style={{
      background: "var(--surface-0)",
      border: "1.5px solid var(--surface-3)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 22px",
      boxShadow: "var(--shadow-sm)",
      transition: "all var(--transition)",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = accent + "40";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `var(--shadow-md), 0 0 20px ${accent}12`;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--surface-3)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
      className="animate-fadeInUp"
    >
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: accent + "08",
        transform: "translate(30%, -30%)",
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", position: "relative", zIndex: 1 }}>
        <div style={{
          width: "44px", height: "44px",
          borderRadius: "12px",
          background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)`,
          border: `1.5px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`ti ${icon}`} style={{ fontSize: "20px", color: accent, fontWeight: 600 }} />
        </div>
      </div>
      <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, marginBottom: "8px", position: "relative", zIndex: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.3px", position: "relative", zIndex: 1 }}>
        {label}
      </p>
    </div>
  );
}

function ClaimRow({ claim, expanded, onToggle, onAction, acting }: {
  claim: Claim;
  expanded: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
  acting: boolean;
}) {
  const fraudColor: Record<string, string> = {
    High: "#DC2626", Medium: "#D97706", Low: "#16A34A",
  };

  return (
    <div style={{
      background: "var(--surface-0)",
      border: `1.5px solid ${expanded ? "var(--brand-300)" : "var(--surface-3)"}`,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      boxShadow: expanded ? "0 8px 24px rgba(15,23,42,0.12)" : "var(--shadow-sm)",
      transition: "all var(--transition)",
    }}>
      {/* Left accent bar for fraud risk */}
      {claim.ai_result && (
        <div style={{
          height: "4px",
          background: fraudColor[claim.ai_result.fraud_risk] ?? "var(--surface-3)",
          opacity: 0.8,
        }} />
      )}

      {/* Header row */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 22px",
          cursor: "pointer",
          userSelect: "none",
          gap: "14px",
          transition: "background var(--transition)",
          background: expanded ? "var(--surface-1)" : "transparent",
        }}
        onMouseEnter={e => !expanded && (e.currentTarget.parentElement!.style.borderColor = "var(--brand-200)")}
        onMouseLeave={e => !expanded && (e.currentTarget.parentElement!.style.borderColor = "var(--surface-3)")}
      >
        {/* Avatar */}
        <div style={{
          width: "44px", height: "44px", flexShrink: 0,
          borderRadius: "10px",
          background: "linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%)",
          border: "1.5px solid var(--brand-100)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Serif Display', serif",
          fontSize: "16px",
          fontWeight: 700,
          color: "var(--brand-700)",
          boxShadow: "0 2px 8px rgba(59,126,200,0.15)",
        }}>
          {claim.customer_name.charAt(0).toUpperCase()}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {claim.customer_name}
            </p>
            <span style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              padding: "2px 8px",
              background: "var(--surface-2)",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontWeight: 500,
            }}>
              #{claim.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
              <i className="ti ti-currency-rupee" style={{ fontSize: "13px", color: "var(--brand-600)", fontWeight: 600 }} />
              <span style={{ fontWeight: 600 }}>₹{Number(claim.claim_amount).toLocaleString("en-IN")}</span>
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
              <i className="ti ti-calendar" style={{ fontSize: "13px", color: "var(--text-muted)" }} />
              {new Date(claim.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {claim.ai_result && (
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-cpu" style={{ fontSize: "13px", color: "var(--brand-600)", fontWeight: 600 }} />
                {claim.ai_result.confidence_score}% confidence
              </span>
            )}
          </div>
        </div>

        {/* Badges + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <StatusBadge status={claim.status} size="sm" />
          {claim.ai_result && <StatusBadge status={claim.ai_result.fraud_risk} size="sm" />}
          <div style={{
            width: "28px", height: "28px",
            borderRadius: "7px",
            background: "var(--surface-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all var(--transition)",
            transform: expanded ? "rotate(180deg)" : "none",
            color: "var(--text-muted)",
          }}>
            <i className="ti ti-chevron-down" style={{ fontSize: "15px" }} />
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          borderTop: "1.5px solid var(--surface-2)",
          padding: "24px 22px",
          background: "linear-gradient(to bottom, transparent, rgba(59,126,200,0.02))",
        }} className="animate-slideDown">
          {/* Damage description */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{
              fontSize: "12px", color: "var(--text-muted)",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "10px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <i className="ti ti-file-description" style={{ fontSize: "13px" }} />
              Damage Description
            </p>
            <p style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              padding: "14px 16px",
              background: "var(--surface-1)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--surface-3)",
            }}>
              {claim.damage_desc}
            </p>
          </div>

          {/* AI Result card */}
          {claim.ai_result && <AIResultCard result={claim.ai_result} variant="provider" />}

          {/* Action buttons */}
          {claim.status === "ANALYSED" && (
            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "22px",
              paddingTop: "20px",
              borderTop: "1.5px solid var(--surface-2)",
              flexWrap: "wrap",
            }}>
              <ActionButton
                label="Approve Claim"
                icon="ti-circle-check"
                onClick={() => onAction("APPROVED")}
                disabled={acting}
                variant="success"
              />
              <ActionButton
                label="Flag for Investigation"
                icon="ti-search"
                onClick={() => onAction("INVESTIGATE")}
                disabled={acting}
                variant="warning"
              />
              <ActionButton
                label="Reject Claim"
                icon="ti-circle-x"
                onClick={() => onAction("REJECTED")}
                disabled={acting}
                variant="danger"
              />
            </div>
          )}

          {(claim.status === "APPROVED" || claim.status === "REJECTED") && (
            <div style={{
              marginTop: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 16px",
              background: claim.status === "APPROVED" ? "var(--success-bg)" : "var(--danger-bg)",
              borderRadius: "var(--radius-md)",
              border: `1.5px solid ${claim.status === "APPROVED" ? "var(--success-border)" : "var(--danger-border)"}`,
            }}>
              <i
                className={`ti ${claim.status === "APPROVED" ? "ti-circle-check" : "ti-circle-x"}`}
                style={{
                  fontSize: "18px",
                  color: claim.status === "APPROVED" ? "var(--success-text)" : "var(--danger-text)",
                }}
              />
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: claim.status === "APPROVED" ? "var(--success-text)" : "var(--danger-text)",
              }}>
                Final decision recorded: {claim.status === "APPROVED" ? "Claim Approved" : "Claim Rejected"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({ label, icon, onClick, disabled, variant }: {
  label: string; icon: string; onClick: () => void;
  disabled: boolean; variant: "success" | "warning" | "danger";
}) {
  const styles = {
    success: { bg: "var(--success-bg)", color: "var(--success-text)", border: "var(--success-border)", hoverBg: "#dcfce7" },
    warning: { bg: "var(--warning-bg)", color: "var(--warning-text)", border: "var(--warning-border)", hoverBg: "#fef3c7" },
    danger: { bg: "var(--danger-bg)", color: "var(--danger-text)", border: "var(--danger-border)", hoverBg: "#ffe4e6" },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "9px 16px",
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        borderRadius: "var(--radius-md)",
        fontSize: "13px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all var(--transition)",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = s.hoverBg; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = s.bg; }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: "14px" }} />
      {label}
    </button>
  );
}

export default function ProviderDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const load = async () => {
    setError("");
    setLoading(true);
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

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === "PENDING").length,
    analysed: claims.filter(c => c.status === "ANALYSED").length,
    approved: claims.filter(c => c.status === "APPROVED").length,
    highRisk: claims.filter(c => c.ai_result?.fraud_risk === "High").length,
  };

  const filters = ["ALL", "PENDING", "ANALYSED", "APPROVED", "REJECTED"];
  const filtered = filter === "ALL" ? claims : claims.filter(c => c.status === filter);

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px", marginBottom: "24px" }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "var(--radius-lg)", marginBottom: "12px" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "32px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{
              width: "40px", height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--brand-600) 0%, var(--brand-700) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(35,82,128,0.3)",
            }}>
              <i className="ti ti-layout-dashboard" style={{ fontSize: "20px", color: "#fff", fontWeight: 600 }} />
            </div>
            <div>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "28px",
                color: "var(--text-primary)",
                fontWeight: 600,
              }}>
                Claims Dashboard
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.3px" }}>
                AI-Powered Claim Management & Analysis
              </p>
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Review AI-assessed claims and take final action on policyholder submissions
          </p>
        </div>
        <button
          onClick={load}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "10px 18px",
            background: "var(--surface-0)",
            border: "1.5px solid var(--surface-3)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-sm)",
            transition: "all var(--transition)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-300)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-50)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-700)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--surface-3)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-0)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          }}
        >
          <i className="ti ti-refresh" style={{ fontSize: "15px" }} />
          Refresh Claims
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "28px" }}>
        <StatCard icon="ti-files" label="Total Claims" value={stats.total} accent="var(--brand-600)" />
        <StatCard icon="ti-clock" label="Awaiting Review" value={stats.analysed} accent="#D97706" />
        <StatCard icon="ti-hourglass" label="Pending Analysis" value={stats.pending} accent="#3B7EC8" />
        <StatCard icon="ti-circle-check" label="Approved Claims" value={stats.approved} accent="#16A34A" />
        <StatCard icon="ti-shield-x" label="High Fraud Risk" value={stats.highRisk} accent="#DC2626" />
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: "14px 18px",
          background: "var(--danger-bg)",
          border: "1.5px solid var(--danger-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          color: "var(--danger-text)",
          marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "10px",
          fontWeight: 600,
        }}>
          <i className="ti ti-alert-circle" style={{ fontSize: "16px" }} />
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div style={{
        display: "flex",
        gap: "6px",
        marginBottom: "20px",
        background: "var(--surface-0)",
        border: "1.5px solid var(--surface-3)",
        borderRadius: "var(--radius-md)",
        padding: "5px",
        width: "fit-content",
        boxShadow: "var(--shadow-sm)",
      }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13px",
              fontWeight: filter === f ? 600 : 500,
              background: filter === f ? "var(--brand-900)" : "transparent",
              color: filter === f ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all var(--transition)",
            }}
            onMouseEnter={e => {
              if (filter !== f) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-1)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              }
            }}
            onMouseLeave={e => {
              if (filter !== f) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              }
            }}
          >
            {f === "ALL" ? `All (${claims.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !error && (
        <div style={{
          padding: "64px 24px",
          textAlign: "center",
          border: "1.5px dashed var(--surface-3)",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, var(--surface-1) 0%, var(--brand-50) 100%)",
        }}>
          <div style={{
            width: "56px", height: "56px",
            borderRadius: "14px",
            background: "var(--surface-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <i className="ti ti-inbox" style={{ fontSize: "26px", color: "var(--text-muted)" }} />
          </div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            No claims found
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {filter === "ALL" ? "Submit a claim from the Customer Portal to get started." : `No claims with status "${filter}".`}
          </p>
        </div>
      )}

      {/* Claim list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((claim, i) => (
          <div key={claim.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fadeInUp">
            <ClaimRow
              claim={claim}
              expanded={expanded === claim.id}
              onToggle={() => setExpanded(expanded === claim.id ? null : claim.id)}
              onAction={(action) => handleAction(claim.id, action)}
              acting={acting === claim.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
