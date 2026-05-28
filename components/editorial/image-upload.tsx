"use client";

import { useRef, useState } from "react";
import { Btn } from "./button";
import styles from "./image-upload.module.css";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  uploading?: boolean;
  error?: string | null;
  accept?: string;
  maxBytes?: number;
  hint?: string;
  shape?: "square" | "circle";
  size?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  uploading = false,
  error,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  hint = "PNG, JPEG, WebP or GIF · up to 5 MB",
  shape = "square",
  size = 72,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const isCircle = shape === "circle";
  const overlayClass = isCircle
    ? `${styles.editOverlay} ${styles.circleOverlay}`
    : styles.editOverlay;
  const borderRadius = isCircle ? 9999 : 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError(null);

    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setLocalError("Unsupported image type. Use PNG, JPEG, WebP, or GIF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(`File exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const url = await onUpload(file);
      onChange(url);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const displayError = localError ?? error;

  return (
    <div
      className={`flex flex-col items-center gap-8 border-ink${className ? ` ${className}` : ""}`}
      style={{ background: "var(--paper-2)", padding: "20px", boxShadow: "var(--shadow-stamp)" }}
    >
      <p
        style={{
          fontSize: "var(--ts-meta)",
          fontWeight: 700,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Avatar
      </p>

      <div className="relative" style={{ width: size, height: size }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Uploaded image"
            style={{
              width: size,
              height: size,
              objectFit: "cover",
              border: "2px solid var(--ink)",
              borderRadius,
            }}
          />
        ) : (
          <div
            style={{
              width: size,
              height: size,
              border: "2px solid var(--ink)",
              borderRadius,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              color: "var(--ink-3)",
              background: "var(--paper-3)",
            }}
          >
            ?
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={overlayClass}
        >
          Edit
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      <div className="flex w-full flex-col gap-4">
        <Btn
          variant="secondary"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload photo"}
        </Btn>
        {value && (
          <Btn
            variant="secondary"
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
          >
            Remove
          </Btn>
        )}
      </div>

      {displayError && <p className="text-center text-base text-red">{displayError}</p>}
      <p className="text-center text-sm text-ink-3">{hint}</p>
    </div>
  );
}
