import { useRef, useState } from "react";

interface Props {
    accept: string;
    multiple?: boolean;
    label: string;
    hint?: string;
    icon: string;
    files: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
}

export default function FileUpload({ accept, multiple, label, hint, icon, files, onChange, maxFiles }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = Array.from(e.dataTransfer.files).filter(f => {
            if (accept === ".pdf") return f.type === "application/pdf";
            if (accept === "image/*") return f.type === "image/jpeg" || f.type === "image/png";
            return true;
        });
        const combined = multiple ? [...files, ...dropped].slice(0, maxFiles ?? 10) : dropped.slice(0, 1);
        onChange(combined);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []).filter(f => {
            if (accept === ".pdf") return f.type === "application/pdf";
            if (accept === "image/*") return f.type === "image/jpeg" || f.type === "image/png";
            return true;
        });
        const combined = multiple ? [...files, ...selected].slice(0, maxFiles ?? 10) : selected.slice(0, 1);
        onChange(combined);
    };

    const removeFile = (idx: number) => {
        onChange(files.filter((_, i) => i !== idx));
    };

    const hasFiles = files.length > 0;

    return (
        <div>
            {/* Drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragging ? "var(--brand-400)" : hasFiles ? "var(--brand-200)" : "var(--surface-3)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "28px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging ? "var(--brand-50)" : hasFiles ? "rgba(59,126,200,0.03)" : "var(--surface-0)",
                    transition: "all var(--transition)",
                }}
            >
                <div style={{
                    width: "48px", height: "48px",
                    borderRadius: "12px",
                    background: dragging ? "var(--brand-100)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px",
                    transition: "all var(--transition)",
                    border: dragging ? "1.5px solid var(--brand-300)" : "1.5px solid transparent",
                }}>
                    <i className={`ti ${icon}`} style={{
                        fontSize: "24px",
                        color: dragging ? "var(--brand-600)" : "var(--text-muted)",
                        transition: "color var(--transition)",
                        fontWeight: 600,
                    }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {label}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    {hint ?? "Drag and drop or click to browse"}
                </p>
                {accept === "image/*" && maxFiles && (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>
                        {files.length}/{maxFiles} photos · Recommended: front, rear, close-up of damage
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    style={{ display: "none" }}
                    onChange={handleChange}
                />
            </div>

            {/* File list */}
            {hasFiles && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {files.map((file, idx) => (
                        <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 14px",
                            background: "var(--surface-1)",
                            border: "1.5px solid var(--surface-3)",
                            borderRadius: "var(--radius-md)",
                            animation: "fadeIn 0.2s ease",
                            transition: "all var(--transition)",
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-200)";
                                (e.currentTarget as HTMLDivElement).style.background = "var(--brand-50)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--surface-3)";
                                (e.currentTarget as HTMLDivElement).style.background = "var(--surface-1)";
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                <div style={{
                                    width: "32px", height: "32px",
                                    borderRadius: "8px",
                                    background: file.type === "application/pdf" ? "var(--danger-bg)" : "var(--info-bg)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                    border: file.type === "application/pdf" ? "1.5px solid var(--danger-border)" : "1.5px solid var(--info-border)",
                                }}>
                                    <i className={`ti ${file.type === "application/pdf" ? "ti-file-type-pdf" : "ti-photo"}`}
                                        style={{
                                            fontSize: "16px",
                                            color: file.type === "application/pdf" ? "var(--danger-text)" : "var(--info-text)",
                                            fontWeight: 700,
                                        }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {file.name}
                                    </p>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                                        {(file.size / 1024).toFixed(0)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); removeFile(idx); }}
                                style={{
                                    border: "none", background: "transparent",
                                    padding: "6px", cursor: "pointer",
                                    color: "var(--text-muted)", borderRadius: "6px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all var(--transition)",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--danger-text)";
                                    (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-bg)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                            >
                                <i className="ti ti-x" style={{ fontSize: "16px", fontWeight: 700 }} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}