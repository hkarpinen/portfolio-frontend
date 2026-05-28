"use client";

import { Btn } from "@/components/editorial";
import { useState } from "react";
import { JoinHouseholdModal } from "./join-modal";

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
