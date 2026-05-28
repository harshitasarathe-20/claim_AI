import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <div className="navbar-logo">
          <i className="ti ti-shield-check" />
        </div>
        <div className="navbar-title">
          <span className="navbar-title-main">ClaimAI</span>
          <span className="navbar-title-sub">Insurance Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="navbar-nav">
        <NavLink to="/" label="Customer Portal" icon="ti-user" active={pathname === "/"} />
        <NavLink to="/provider" label="Provider Dashboard" icon="ti-layout-dashboard" active={pathname === "/provider"} />
      </div>

      {/* Status */}
      <div className="navbar-status">
        <span className="status-indicator" />
        <span className="status-text">AI Engine Online</span>
      </div>
    </nav>
  );
}

function NavLink({ to, label, icon, active }: { to: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`nav-link ${active ? "active" : ""}`}
    >
      <i className={`ti ${icon}`} />
      {label}
    </Link>
  );
}