"use client";

import { useState } from "react";
import { JoinHouseholdModal } from "./join-modal";
import { Btn } from "@/components/editorial/button";

export function JoinHouseholdButton({
  size = "sm",
}: { size?: "xs" | "sm" | "md" | "lg" | "xl" } = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Btn variant="secondary" size={size} onClick={() => setOpen(true)}>
        Join with code
      </Btn>
      <JoinHouseholdModal open={open} onOpenChange={setOpen} />
    </>
  );
}
