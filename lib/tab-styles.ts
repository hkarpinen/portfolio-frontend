import type React from "react";

const tabTriggerBase: React.CSSProperties = {
  padding: "10px 16px",
  background: "none",
  border: "none",
  borderBottom: "2px solid transparent",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  marginBottom: "-1px",
  color: "var(--text-3)",
  cursor: "pointer",
  transition: "color 110ms, border-color 110ms",
};

export const tabTriggerBody: React.CSSProperties = {
  ...tabTriggerBase,
  fontFamily: "var(--ff-body)",
  fontSize: "var(--ts-body)",
  fontWeight: 600,
};
