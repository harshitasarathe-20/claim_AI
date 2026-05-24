import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import CustomerPortal from "./pages/CustomerPortal";
import ProviderDashboard from "./pages/ProviderDashboard";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fadeIn">
      <Routes location={location}>
        <Route path="/" element={<CustomerPortal />} />
        <Route path="/provider" element={<ProviderDashboard />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "var(--surface-1)" }}>
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
