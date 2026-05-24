interface Props {
  status: string;
  size?: "sm" | "md";
}

interface BadgeConfig {
  bg: string;
  color: string;
  border: string;
  text: string;
  icon: string;
}

const config: Record<string, BadgeConfig> = {
  PENDING: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", text: "Pending", icon: "ti-clock" },
  ANALYSED: { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", text: "AI Analysed", icon: "ti-cpu" },
  APPROVED: { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0", text: "Approved", icon: "ti-circle-check" },
  REJECTED: { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3", text: "Rejected", icon: "ti-circle-x" },
  Low: { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0", text: "Low Risk", icon: "ti-shield-check" },
  Medium: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", text: "Medium Risk", icon: "ti-shield-exclamation" },
  High: { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3", text: "High Risk", icon: "ti-shield-x" },
  Approve: { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0", text: "Approve", icon: "ti-check" },
  Investigate: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", text: "Investigate", icon: "ti-search" },
  Reject: { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3", text: "Reject", icon: "ti-x" },
};

export default function StatusBadge({ status, size = "md" }: Props) {
  const c = config[status] ?? {
    bg: "var(--surface-2)", color: "var(--text-secondary)", border: "var(--surface-3)",
    text: status, icon: "ti-point",
  };

  const isSmall = size === "sm";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: isSmall ? "4px" : "5px",
      padding: isSmall ? "2px 8px" : "4px 10px",
      borderRadius: "999px",
      fontSize: isSmall ? "11px" : "12px",
      fontWeight: 500,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      <i className={`ti ${c.icon}`} style={{ fontSize: isSmall ? "11px" : "12px" }} />
      {c.text}
    </span>
  );
}
