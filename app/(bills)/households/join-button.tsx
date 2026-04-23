"use client";

import { useState } from "react";
import { JoinHouseholdModal } from "./join-modal";

export function JoinHouseholdButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--text-2)",
          padding: "8px 16px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
          fontFamily: "var(--ff-body)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-3)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)"; }}
      >
        Join
      </button>
      {open && <JoinHouseholdModal onClose={() => setOpen(false)} />}
    </>
  );
}
