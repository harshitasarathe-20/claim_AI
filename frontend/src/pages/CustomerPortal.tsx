import { useState } from "react";
import { submitClaim } from "../api/claimApi";
import type { AIResult } from "../types/claim.types";
import AIResultCard from "../components/AIResultCard";

export default function CustomerPortal() {
  const [name, setName]           = useState("");
  const [amount, setAmount]       = useState("");
  const [desc, setDesc]           = useState("");
  const [images, setImages]       = useState<File[]>([]);
  const [policy, setPolicy]       = useState<File | null>(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<AIResult | null>(null);
  const [error, setError]         = useState("");

  const field: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111827",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const label = (text: string) => (
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 500,
        color: "#374151",
        marginBottom: "6px",
      }}
    >
      {text}
    </label>
  );

  const handleSubmit = async () => {
    if (!name || !amount || !desc || !policy || images.length === 0) {
      setError("Please fill all fields, upload a policy PDF and at least one photo.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await submitClaim(name, amount, desc, images, policy);
      setResult(res.ai_result);
    } catch {
      setError("Could not reach the backend. Make sure it is running on localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>
        Submit a claim
      </h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "28px" }}>
        Upload your policy and damage photos — AI will estimate your coverage instantly.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

        <div>
          {label("Your full name")}
          <input
            style={field}
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          {label("Claim amount (₹)")}
          <input
            style={field}
            type="number"
            placeholder="e.g. 85000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          {label("Describe the damage")}
          <textarea
            style={{ ...field, height: "88px", resize: "vertical" }}
            placeholder="e.g. Front bumper and bonnet damaged in a rear-end collision at a traffic signal..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div>
          {label("Policy document (PDF)")}
          <input
            type="file"
            accept=".pdf"
            style={{ fontSize: "13px", color: "#374151" }}
            onChange={(e) => setPolicy(e.target.files?.[0] ?? null)}
          />
          {policy && (
            <p style={{ fontSize: "12px", color: "#16A34A", marginTop: "5px" }}>
              ✓ {policy.name}
            </p>
          )}
        </div>

        <div>
          {label("Damage photos — upload 3 to 5 for best results")}
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ fontSize: "13px", color: "#374151" }}
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
          {images.length > 0 && (
            <p style={{ fontSize: "12px", color: "#16A34A", marginTop: "5px" }}>
              ✓ {images.length} photo{images.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#991B1B",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "11px 0",
            background: loading ? "#A5B4FC" : "#4F46E5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Analysing your claim..." : "Submit claim →"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "36px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
            Your coverage estimate
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>
            This is an AI estimate only. The final decision is made by your insurer.
          </p>
          <AIResultCard result={result} />
        </div>
      )}
    </div>
  );
}