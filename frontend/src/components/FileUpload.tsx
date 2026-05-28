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
        <div className="file-upload-wrapper">
            {/* Upload Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`file-upload-zone ${dragging ? "dragging" : ""} ${hasFiles ? "with-files" : ""}`}
            >
                <div className="file-upload-icon">
                    <i className={`ti ${icon}`} />
                </div>
                <p className="file-upload-label">{label}</p>
                <p className="file-upload-hint">{hint ?? "Drag and drop or click to browse"}</p>
                {accept === "image/*" && maxFiles && (
                    <p className="file-upload-counter">
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

            {/* File List */}
            {hasFiles && (
                <div className="file-list">
                    {files.map((file, idx) => (
                        <div key={idx} className="file-item">
                            <div className="file-item-info">
                                <div className={`file-item-icon ${file.type === "application/pdf" ? "pdf" : "image"}`}>
                                    <i className={`ti ${file.type === "application/pdf" ? "ti-file-type-pdf" : "ti-photo"}`} />
                                </div>
                                <div>
                                    <p className="file-item-name">{file.name}</p>
                                    <p className="file-item-size">{(file.size / 1024).toFixed(0)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); removeFile(idx); }}
                                className="file-item-remove"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}