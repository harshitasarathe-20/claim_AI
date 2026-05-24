interface Props {
  status: string;
}

const config: Record<string, { bg: string; color: string; text: string }> = {
  PENDING:     { bg: "#FEF9C3", color: "#854D0E", text: "Pending" },
  ANALYSED:    { bg: "#DBEAFE", color: "#1E40AF", text: "Analysed" },
  APPROVED:    { bg: "#DCFCE7", color: "#166534", text: "Approved" },
  REJECTED:    { bg: "#FEE2E2", color: "#991B1B", text: "Rejected" },
  Low:         { bg: "#DCFCE7", color: "#166534", text: "Low Risk" },
  Medium:      { bg: "#FEF9C3", color: "#854D0E", text: "Medium Risk" },
  High:        { bg: "#FEE2E2", color: "#991B1B", text: "High Risk" },
  Approve:     { bg: "#DCFCE7", color: "#166534", text: "Approve" },
  Investigate: { bg: "#FEF9C3", color: "#854D0E", text: "Investigate" },
  Reject:      { bg: "#FEE2E2", color: "#991B1B", text: "Reject" },
};

export default function StatusBadge({ status }: Props) {
  const c = config[status] ?? { bg: "#F3F4F6", color: "#374151", text: status };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 500,
        background: c.bg,
        color: c.color,
      }}
    >
      {c.text}
    </span>
  );
}