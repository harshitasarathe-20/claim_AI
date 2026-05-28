import { useState, useEffect } from "react";
import { fetchClaims, updateAction, fetchMetrics } from "../api/claimApi";
import type { Claim, Metrics } from "../types/claim.types";
import StatusBadge from "../components/StatusBadge";
import AIResultCard from "../components/AIResultCard";


const MOCK_METRICS: Metrics = {
  total_claims: 0,
  pending_claims: 0,
  analysed_claims: 0,
  approved_claims: 0,
  fraud_claims: 0,
  money_saved: 0,
  hours_saved: 0,
};

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  accentClass: string;
}

function MetricCard({ icon, label, value, accentClass }: MetricCardProps) {
  return (
    <div className={`metric-card accent-${accentClass} animate-fadeInUp`}>
      <div>
        <div className="metric-icon-box">
          <i className={`ti ${icon}`} />
        </div>
        <p className="metric-value">{value}</p>
        <p className="metric-label">{label}</p>
      </div>
    </div>
  );
}

interface ClaimRowProps {
  claim: Claim;
  expanded: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
  acting: boolean;
}

function ClaimRow({ claim, expanded, onToggle, onAction, acting }: ClaimRowProps) {
  const fraudColorMap: Record<string, string> = {
    High: "#DC2626",
    Medium: "#D97706",
    Low: "#16A34A",
  };

  return (
    <div className={`claim-row ${expanded ? "expanded" : ""}`}>
      {/* Fraud Risk Color Bar */}
      {claim.ai_result && (
        <div
          style={{
            height: "3px",
            background: fraudColorMap[claim.ai_result.fraud_risk] ?? "var(--surface-3)",
            opacity: 0.8,
          }}
        />
      )}

      {/* Row Header */}
      <div className="claim-row-header" onClick={onToggle}>
        {/* Avatar */}
        <div className="claim-avatar">
          {claim.customer_name.charAt(0).toUpperCase()}
        </div>

        {/* Claim Info */}
        <div className="claim-info">
          <div className="claim-name">
            <p className="claim-name-text">{claim.customer_name}</p>
            <span className="claim-id-badge">#{claim.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="claim-meta">
            <span className="claim-meta-item">
              <i className="ti ti-currency-rupee claim-meta-icon" />
              <span className="claim-meta-currency">
                ₹{Number(claim.claim_amount).toLocaleString("en-IN")}
              </span>
            </span>
            <span className="claim-meta-item">
              <i className="ti ti-calendar claim-meta-icon" />
              {new Date(claim.submitted_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {claim.ai_result && (
              <span className="claim-meta-item">
                <i className="ti ti-cpu claim-meta-icon" />
                {claim.ai_result.confidence_score}% confidence
              </span>
            )}
          </div>
        </div>

        {/* Status Badges & Chevron */}
        <div className="claim-actions">
          <StatusBadge status={claim.status} size="sm" />
          {claim.ai_result && <StatusBadge status={claim.ai_result.fraud_risk} size="sm" />}
          <div className="claim-chevron">
            <i className="ti ti-chevron-down" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--surface-2)",
            padding: "1.5rem 1.375rem",
            background: "linear-gradient(to bottom, transparent, rgba(90,126,200,0.02))",
          }}
          className="animate-slideDown"
        >
          {/* Damage Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.625rem",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <i className="ti ti-file-description" style={{ fontSize: "0.8125rem" }} />
              Damage Description
            </p>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                padding: "0.875rem 1rem",
                background: "var(--surface-1)",
                borderRadius: "var(--radius-md)",
                borderLeft: "3px solid var(--brand-300)",
              }}
            >
              {claim.damage_desc}
            </p>
          </div>

          {/* AI Result Card with Full Analysis */}
          {claim.ai_result && (
            <div style={{ marginBottom: "1.5rem" }}>
              <AIResultCard result={claim.ai_result} variant="provider" />
            </div>
          )}

          {/* Action Buttons */}
          {claim.status === "ANALYSED" && (
            <div
              style={{
                display: "flex",
                gap: "0.625rem",
                marginTop: "1.375rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--surface-2)",
                flexWrap: "wrap",
              }}
            >
              <ActionButton
                label="Approve"
                icon="ti-check"
                onClick={() => onAction("Approve")}
                disabled={acting}
                variant="success"
              />
              <ActionButton
                label="Investigate"
                icon="ti-search"
                onClick={() => onAction("Investigate")}
                disabled={acting}
                variant="warning"
              />
              <ActionButton
                label="Reject"
                icon="ti-x"
                onClick={() => onAction("Reject")}
                disabled={acting}
                variant="danger"
              />
            </div>
          )}

          {/* Final Decision */}
          {(claim.status === "APPROVED" || claim.status === "REJECTED") && (
            <div
              style={{
                marginTop: "1.125rem",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.875rem 1rem",
                background:
                  claim.status === "APPROVED" ? "var(--success-bg)" : "var(--danger-bg)",
                borderRadius: "var(--radius-md)",
                border:
                  claim.status === "APPROVED"
                    ? "1px solid var(--success-border)"
                    : "1px solid var(--danger-border)",
              }}
            >
              <i
                className={`ti ${
                  claim.status === "APPROVED" ? "ti-circle-check" : "ti-circle-x"
                }`}
                style={{
                  fontSize: "1.125rem",
                  color: claim.status === "APPROVED" ? "var(--success-text)" : "var(--danger-text)",
                }}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: claim.status === "APPROVED" ? "var(--success-text)" : "var(--danger-text)",
                }}
              >
                Final decision recorded:{" "}
                {claim.status === "APPROVED" ? "Claim Approved" : "Claim Rejected"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
  variant: "success" | "warning" | "danger";
}

function ActionButton({ label, icon, onClick, disabled, variant }: ActionButtonProps) {
  const styles = {
    success: {
      bg: "var(--success-bg)",
      color: "var(--success-text)",
      border: "var(--success-border)",
      hoverBg: "rgba(16, 185, 129, 0.2)",
    },
    warning: {
      bg: "var(--warning-bg)",
      color: "var(--warning-text)",
      border: "var(--warning-border)",
      hoverBg: "rgba(245, 158, 11, 0.2)",
    },
    danger: {
      bg: "var(--danger-bg)",
      color: "var(--danger-text)",
      border: "var(--danger-border)",
      hoverBg: "rgba(239, 68, 68, 0.2)",
    },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.5625rem 1rem",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--radius-md)",
        fontSize: "0.8125rem",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all var(--transition)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = s.hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = s.bg;
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: "0.875rem" }} />
      {label}
    </button>
  );
}

export default function ProviderDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(MOCK_METRICS);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [claimsData, metricsData] = await Promise.all([
        fetchClaims(),
        fetchMetrics(),
      ]);
      setClaims(claimsData.reverse());
      setMetrics(metricsData);
    } catch {
      setError("Failed to load data. Make sure backend is running on localhost:8000.");
      // Use mock metrics as fallback so UI still displays
      setMetrics(MOCK_METRICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (claimId: string, action: string) => {
    setActing(claimId);
    try {
      await updateAction(claimId, action);
      await load();
    } catch {
      setError("Failed to update claim status.");
    } finally {
      setActing(null);
    }
  };

  const filters = ["ALL", "PENDING", "ANALYSED", "APPROVED", "REJECTED"];
  const filtered = filter === "ALL" ? claims : claims.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="ti ti-cpu loading-spinner-icon" />
            </div>
            <p className="loading-text">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <div className="dashboard-icon">
              <i className="ti ti-layout-dashboard" />
            </div>
            <h1 className="dashboard-title-text">Claims Dashboard</h1>
          </div>
          <p className="dashboard-subtitle">
            Real-time overview of all insurance claims with AI-powered fraud detection and analysis.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4">
          <MetricCard
            icon="ti-file-check"
            label="Total Claims"
            value={metrics.total_claims}
            accentClass="blue"
          />
          <MetricCard
            icon="ti-clock"
            label="Pending Analysis"
            value={metrics.pending_claims}
            accentClass="amber"
          />
          <MetricCard
            icon="ti-circle-check"
            label="Approved Claims"
            value={metrics.approved_claims}
            accentClass="success"
          />
          <MetricCard
            icon="ti-shield-x"
            label="Fraud Detected"
            value={metrics.fraud_claims}
            accentClass="danger"
          />
        </div>

        {/* KPI Section */}
        <div className="kpi-section">
          <div className="kpi-grid">
            {/* Money Saved */}
            <div className="kpi-card money">
              <div>
                <div className="kpi-icon-box">
                  <i className="ti ti-cash" />
                </div>
                <p className="kpi-label">Money Saved from Fraud</p>
                <p className="kpi-value">
                  ₹{Number(metrics.money_saved).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Hours Saved */}
            <div className="kpi-card hours">
              <div>
                <div className="kpi-icon-box">
                  <i className="ti ti-clock-hour-3" />
                </div>
                <p className="kpi-label">Human Hours Saved</p>
                <p className="kpi-value">
                  {metrics.hours_saved.toFixed(1)}<span className="kpi-value-unit">h</span>
                </p>
              </div>
            </div>

            {/* Analysis Rate */}
            <div className="kpi-card rate">
              <div>
                <div className="kpi-icon-box">
                  <i className="ti ti-sparkles" />
                </div>
                <p className="kpi-label">AI Analysis Rate</p>
                <p className="kpi-value">
                  {metrics.total_claims > 0
                    ? Math.round((metrics.analysed_claims / metrics.total_claims) * 100)
                    : 0}
                  <span className="kpi-value-unit">%</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <i className="ti ti-alert-circle error-alert-icon" />
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-tab ${filter === f ? "active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Empty State or Claims List */}
        {filtered.length === 0 && !error ? (
          <div className="empty-state">
            <i className="ti ti-inbox empty-state-icon" />
            <p className="empty-state-text">No {filter === "ALL" ? "claims" : filter.toLowerCase()} yet</p>
          </div>
        ) : (
          <div className="claim-rows-container">
            {filtered.map((claim) => (
              <ClaimRow
                key={claim.id}
                claim={claim}
                expanded={expanded === claim.id}
                onToggle={() => setExpanded(expanded === claim.id ? null : claim.id)}
                onAction={(action) => handleAction(claim.id, action)}
                acting={acting === claim.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}