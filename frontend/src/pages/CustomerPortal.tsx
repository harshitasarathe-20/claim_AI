import { useState } from "react";
import { submitClaim } from "../api/claimApi";
import type { AIResult } from "../types/claim.types";
import AIResultCard from "../components/AIResultCard";
import FileUpload from "../components/FileUpload";

const STEPS = ["Claim Details", "Upload Files", "AI Analysis"];

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="form-label">
      {text}
      {required && <span className="form-required">*</span>}
    </label>
  );
}

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => (
        <div
          key={i}
          className="step-item"
        >
          <div className="step-circle">
            <div
              className={`step-number ${i < current ? "completed" : i === current ? "current" : "pending"
                }`}
            >
              {i < current ? (
                <i className="ti ti-check" />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={`step-label ${i === current ? "current" : ""}`}>
              {step}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div
              className={`step-line ${i < current ? "completed" : "pending"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CustomerPortal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [policy, setPolicy] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const handleSubmit = async () => {
    if (
      !name ||
      !email ||
      !amount ||
      !desc ||
      policy.length === 0 ||
      images.length < 3
    ) {
      setError("Please complete all fields and upload at least 3 images.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    setStep(2);

    try {
      const res = await submitClaim(
        name,
        email,
        amount,
        desc,
        images,
        policy[0]
      );

      setResult(res.ai_result);
    } catch {
      setError(
        "Could not reach the backend. Make sure it is running on localhost:8000."
      );
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep0 =
    name.trim() && email.trim() && amount.trim() && desc.trim();

  const canProceedStep1 =
    policy.length > 0 && images.length >= 3 && images.length <= 10;

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "36px 24px",
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "32px",
        alignItems: "start",
      }}
    >

      <div>
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--brand-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="ti ti-car"
                style={{ fontSize: "18px", color: "var(--brand-700)" }}
              />
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "22px",
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                Submit a Claim
              </h1>
            </div>
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              maxWidth: "480px",
              lineHeight: 1.6,
            }}
          >
            Upload your policy document and damage photos. Our AI engine
            analyses your claim in seconds and provides an instant coverage
            estimate.
          </p>
        </div>

        <StepIndicator current={step} steps={STEPS} />

        <div
          style={{
            background: "var(--surface-0)",
            border: "1px solid var(--surface-3)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >

          {step === 0 && (
            <div
              style={{ padding: "24px 28px" }}
              className="animate-slideDown"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--surface-2)",
                }}
              >
                <i
                  className="ti ti-id-badge"
                  style={{ fontSize: "16px", color: "var(--brand-600)" }}
                />

                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Claim Details
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <Label text="Full name" required />

                  <div style={{ position: "relative" }}>
                    <i
                      className="ti ti-user"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "15px",
                        color: "var(--text-muted)",
                        pointerEvents: "none",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                </div>

                <div>
                  <Label text="Email address" required />

                  <div style={{ position: "relative" }}>
                    <i
                      className="ti ti-mail"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "15px",
                        color: "var(--text-muted)",
                        pointerEvents: "none",
                      }}
                    />

                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                </div>

                <div>
                  <Label text="Claim amount" required />

                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        pointerEvents: "none",
                      }}
                    >
                      ₹
                    </span>

                    <input
                      type="number"
                      placeholder="e.g. 85000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ paddingLeft: "26px" }}
                    />
                  </div>
                </div>

                <div>
                  <Label text="Describe the damage" required />

                  <textarea
                    placeholder="Describe what happened — e.g. Front bumper and bonnet damaged in a rear-end collision at a traffic signal on MG Road. Airbag did not deploy."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    style={{ minHeight: "110px" }}
                  />

                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "5px",
                    }}
                  >
                    Be as specific as possible — location, cause, and visible
                    damage areas.
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setStep(1)}
                  disabled={!canProceedStep0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "10px 22px",
                    background: canProceedStep0
                      ? "var(--brand-900)"
                      : "var(--surface-3)",
                    color: canProceedStep0
                      ? "#fff"
                      : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: canProceedStep0 ? "pointer" : "not-allowed",
                    transition: "all 0.15s",
                  }}
                >
                  Continue
                  <i
                    className="ti ti-arrow-right"
                    style={{ fontSize: "14px" }}
                  />
                </button>
              </div>
            </div>
          )}


          {step === 1 && (
            <div
              style={{ padding: "24px 28px" }}
              className="animate-slideDown"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--surface-2)",
                }}
              >
                <i
                  className="ti ti-upload"
                  style={{ fontSize: "16px", color: "var(--brand-600)" }}
                />

                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Upload Documents
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "22px",
                }}
              >
                <div>
                  <Label text="Policy document (PDF)" required />

                  <FileUpload
                    accept=".pdf"
                    label="Upload your policy PDF"
                    hint="Drag and drop or click to browse"
                    icon="ti-file-type-pdf"
                    files={policy}
                    onChange={setPolicy}
                  />
                </div>

                <div>
                  <Label text="Damage photos" required />

                  <FileUpload
                    accept="image/*"
                    multiple
                    maxFiles={10}
                    label="Upload damage photos (minimum 3, maximum 10)"
                    hint="Drag and drop or click to browse — JPG and PNG only"
                    icon="ti-camera"
                    files={images}
                    onChange={setImages}
                  />

                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "7px",
                    }}
                  >
                    {images.length < 3 ? (
                      <span style={{ color: "#DC2626", fontWeight: 500 }}>
                        ✕ Minimum 3 images required ({images.length}/3)
                      </span>
                    ) : (
                      <span style={{ color: "#16A34A", fontWeight: 500 }}>
                        ✓ {images.length} images selected
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "11px 14px",
                    background: "var(--danger-bg)",
                    border: "1px solid var(--danger-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    color: "var(--danger-text)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i
                    className="ti ti-alert-circle"
                    style={{ fontSize: "15px", flexShrink: 0 }}
                  />
                  {error}
                </div>
              )}

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={() => setStep(0)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "10px 18px",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--surface-3)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="ti ti-arrow-left"
                    style={{ fontSize: "14px" }}
                  />
                  Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!canProceedStep1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    background: canProceedStep1
                      ? "var(--brand-900)"
                      : "var(--surface-3)",
                    color: canProceedStep1
                      ? "#fff"
                      : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: canProceedStep1 ? "pointer" : "not-allowed",
                    transition: "all 0.15s",
                  }}
                >
                  <i
                    className="ti ti-cpu"
                    style={{ fontSize: "14px" }}
                  />
                  Analyse with AI
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div
              style={{ padding: "24px 28px" }}
              className="animate-slideDown"
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: "var(--brand-50)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  >
                    <i
                      className="ti ti-cpu"
                      style={{ fontSize: "24px", color: "var(--brand-600)" }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Analysing your claim...
                  </p>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    AI is reviewing damage photos and policy documents
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      maxWidth: "300px",
                      margin: "20px auto 0",
                    }}
                  >
                    {[
                      "Parsing policy document",
                      "Analysing damage photos",
                      "Mapping coverage clauses",
                    ].map((t, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          className="skeleton"
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />

                        <div
                          className="skeleton"
                          style={{
                            height: "12px",
                            flex: 1,
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : result ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <i
                      className="ti ti-circle-check"
                      style={{ fontSize: "18px", color: "#16A34A" }}
                    />

                    <h2
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      Analysis Complete
                    </h2>
                  </div>

                  <AIResultCard result={result} variant="customer" />

                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setResult(null);
                        setStep(0);
                        setName("");
                        setEmail("");
                        setAmount("");
                        setDesc("");
                        setImages([]);
                        setPolicy([]);
                      }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "7px",
                        padding: "10px",
                        background: "transparent",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--surface-3)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className="ti ti-plus"
                        style={{ fontSize: "14px" }}
                      />
                      New Claim
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>


      <div style={{ position: "sticky", top: "84px" }}>
        <div
          style={{
            background: "var(--surface-0)",
            border: "1px solid var(--surface-3)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              background: "var(--brand-900)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i
                className="ti ti-info-circle"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "15px",
                }}
              />

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                How it works
              </span>
            </div>
          </div>

          <div style={{ padding: "16px 18px" }}>
            {[
              {
                icon: "ti-upload",
                title: "Upload your documents",
                desc: "Provide your policy PDF and 3–5 damage photos for best results.",
              },
              {
                icon: "ti-cpu",
                title: "AI analyses instantly",
                desc: "Gemini 2.5 Flash reads your policy and HIVE inspects damage photos in seconds.",
              },
              {
                icon: "ti-report",
                title: "Get your estimate",
                desc: "Receive a detailed coverage estimate and recommended action.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  paddingBottom: i < 2 ? "14px" : "0",
                  marginBottom: i < 2 ? "14px" : "0",
                  borderBottom:
                    i < 2 ? "1px solid var(--surface-2)" : "none",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    background: "var(--brand-50)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className={`ti ${item.icon} `}
                    style={{
                      fontSize: "15px",
                      color: "var(--brand-700)",
                    }}
                  />
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      marginBottom: "3px",
                    }}
                  >
                    {item.title}
                  </p>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "14px 16px",
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            gap: "10px",
          }}
        >
          <i
            className="ti ti-alert-triangle"
            style={{
              fontSize: "16px",
              color: "var(--accent-amber)",
              flexShrink: 0,
              marginTop: "1px",
            }}
          />

          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--warning-text)",
                marginBottom: "3px",
              }}
            >
              Important
            </p>

            <p
              style={{
                fontSize: "12px",
                color: "var(--warning-text)",
                opacity: 0.85,
                lineHeight: 1.5,
              }}
            >
              This tool provides an AI estimate only. Final coverage decisions
              are made by your insurer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}