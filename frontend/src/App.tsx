import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CustomerPortal from "./pages/CustomerPortal";
import ProviderDashboard from "./pages/ProviderDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<CustomerPortal />} />
          <Route path="/provider" element={<ProviderDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}