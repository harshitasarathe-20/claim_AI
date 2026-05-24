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
            if (accept === "image/*") return f.type.startsWith("image/");
            return true;
        });
        const combined = multiple ? [...files, ...dropped].slice(0, maxFiles ?? 10) : dropped.slice(0, 1);
        onChange(combined);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
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
                    border: `1.5px dashed ${dragging ? "var(--brand-400)" : hasFiles ? "var(--brand-200)" : "var(--surface-3)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "20px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging ? "var(--brand-50)" : hasFiles ? "rgba(59,126,200,0.03)" : "var(--surface-0)",
                    transition: "all 0.15s",
                }}
            >
                <div style={{
                    width: "40px", height: "40px",
                    borderRadius: "10px",
                    background: dragging ? "var(--brand-100)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 10px",
                    transition: "background 0.15s",
                }}>
                    <i className={`ti ${icon}`} style={{
                        fontSize: "20px",
                        color: dragging ? "var(--brand-600)" : "var(--text-muted)",
                        transition: "color 0.15s",
                    }} />
                </div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "3px" }}>
                    {label}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {hint ?? "Drag and drop or click to browse"}
                </p>
                {accept === "image/*" && maxFiles && (
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
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
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {files.map((file, idx) => (
                        <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "var(--surface-1)",
                            border: "1px solid var(--surface-3)",
                            borderRadius: "var(--radius-sm)",
                            animation: "fadeIn 0.2s ease",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                <div style={{
                                    width: "28px", height: "28px",
                                    borderRadius: "6px",
                                    background: file.type === "application/pdf" ? "var(--danger-bg)" : "var(--info-bg)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <i className={`ti ${file.type === "application/pdf" ? "ti-file-type-pdf" : "ti-photo"}`}
                                        style={{
                                            fontSize: "13px",
                                            color: file.type === "application/pdf" ? "var(--danger-text)" : "var(--info-text)",
                                        }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {file.name}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        {(file.size / 1024).toFixed(0)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); removeFile(idx); }}
                                style={{
                                    border: "none", background: "transparent",
                                    padding: "4px", cursor: "pointer",
                                    color: "var(--text-muted)", borderRadius: "4px",
                                    display: "flex", alignItems: "center",
                                    transition: "color 0.15s, background 0.15s",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--danger-text)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-bg)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                            >
                                <i className="ti ti-x" style={{ fontSize: "14px" }} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
