"use client";

import { useState } from "react";
import { JoinHouseholdModal } from "./join-modal";
import styles from "./join-button.module.css";

export function JoinHouseholdButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={styles.btn}
      >
        Join
      </button>
      {open && <JoinHouseholdModal onClose={() => setOpen(false)} />}
    </>
  );
}