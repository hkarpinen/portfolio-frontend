"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCommunity } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

export default function NewCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const createCommunity = useCreateCommunity();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createCommunity.mutate({ name, privacy }, {
      onSuccess: (created) => {
        router.push(`/communities/${encodeURIComponent(created.name)}`);
      },
    });
  }

  return (
    <div className="page-enter" style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "24px", color: "var(--text)", margin: 0 }}>
          Create Community
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "6px", fontSize: "14px" }}>
          Start a new community
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {createCommunity.isError && (
            <div style={{
              fontSize: "13px", color: "var(--danger)",
              background: "var(--danger-s)", border: "1px solid var(--danger)",
              borderRadius: "10px", padding: "10px 14px",
            }}>
              {createCommunity.error instanceof ApiError ? createCommunity.error.message : "An unexpected error occurred."}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={64}
              placeholder="Community Name"
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Visibility
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", boxSizing: "border-box", cursor: "pointer",
              }}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createCommunity.isPending}
            style={{
              background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: "12px",
              padding: "10px 20px", fontWeight: 600, fontSize: "14px",
              cursor: createCommunity.isPending ? "not-allowed" : "pointer",
              opacity: createCommunity.isPending ? 0.6 : 1,
              fontFamily: "var(--ff-body)",
            }}
          >
            {createCommunity.isPending ? "Creating…" : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
}
