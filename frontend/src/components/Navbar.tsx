import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "64px",
      background: "linear-gradient(135deg, var(--brand-900) 0%, var(--brand-800) 100%)",
      borderBottom: "1.5px solid rgba(255,255,255,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "var(--shadow-md)",
      backdropFilter: "blur(8px)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "11px",
          background: "linear-gradient(135deg, #3B7EC8 0%, #2E5FA3 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(59,126,200,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          flexShrink: 0,
        }}>
          <i className="ti ti-shield-check" style={{ color: "#fff", fontSize: "19px", fontWeight: 700 }} />
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "18px",
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
            fontWeight: 600,
          }}>
            ClaimAI
          </span>
          <span style={{
            display: "block",
            fontSize: "10px",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            Insurance Platform
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "4px",
        gap: "2px",
        border: "1px solid rgba(255,255,255,0.12)",
      }}>
        <NavLink to="/" label="Customer Portal" icon="ti-user" active={pathname === "/"} />
        <NavLink to="/provider" label="Provider Dashboard" icon="ti-layout-dashboard" active={pathname === "/provider"} />
      </div>

      {/* Status indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#22C55E",
          boxShadow: "0 0 0 2px rgba(34,197,94,0.3), inset 0 0 2px rgba(0,0,0,0.2)",
          display: "inline-block",
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
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
      padding: "8px 16px",
      borderRadius: "8px",
      textDecoration: "none",
      fontSize: "13px",
      fontWeight: active ? 600 : 500,
      background: active ? "rgba(255,255,255,0.15)" : "transparent",
      color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
      transition: "all var(--transition)",
      whiteSpace: "nowrap",
      border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
    }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.8)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)";
        }
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: "16px" }} />
      {label}
    </Link>
  );
}