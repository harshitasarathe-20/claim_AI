import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const link = (to: string, label: string) => (
    <Link
      to={to}
      style={{
        padding: "7px 16px",
        borderRadius: "7px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: pathname === to ? 500 : 400,
        background: pathname === to ? "#EEF2FF" : "transparent",
        color: pathname === to ? "#4338CA" : "#6B7280",
        border: pathname === to ? "1px solid #C7D2FE" : "1px solid transparent",
        transition: "all 0.15s",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 32px",
        background: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🛡
        </div>
        <span style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>
          ClaimAI
        </span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {link("/", "Customer Portal")}
        {link("/provider", "Provider Dashboard")}
      </div>
    </nav>
  );
}