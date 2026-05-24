import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "60px",
      background: "var(--brand-900)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(15,23,42,0.2)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "34px",
          height: "34px",
          borderRadius: "9px",
          background: "linear-gradient(135deg, #3B7EC8 0%, #1E5FA8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(59,126,200,0.4)",
          flexShrink: 0,
        }}>
          <i className="ti ti-shield-check" style={{ color: "#fff", fontSize: "17px" }} />
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "17px",
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
          }}>
            ClaimAI
          </span>
          <span style={{
            display: "block",
            fontSize: "10px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}>
            Insurance Platform
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "10px",
        padding: "3px",
        gap: "2px",
      }}>
        <NavLink to="/" label="Customer Portal" icon="ti-user" active={pathname === "/"} />
        <NavLink to="/provider" label="Provider Dashboard" icon="ti-layout-dashboard" active={pathname === "/provider"} />
      </div>

      {/* Status indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <span style={{
          width: "7px", height: "7px",
          borderRadius: "50%",
          background: "#22C55E",
          boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
          display: "inline-block",
        }} />
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          AI Engine Online
        </span>
      </div>
    </nav>
  );
}

function NavLink({ to, label, icon, active }: { to: string; label: string; icon: string; active: boolean }) {
  return (
    <Link to={to} style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      padding: "7px 14px",
      borderRadius: "8px",
      textDecoration: "none",
      fontSize: "13px",
      fontWeight: active ? 500 : 400,
      background: active ? "rgba(255,255,255,0.12)" : "transparent",
      color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
      transition: "all 0.15s",
      whiteSpace: "nowrap",
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: "15px" }} />
      {label}
    </Link>
  );
}
