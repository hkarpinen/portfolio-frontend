import React from "react";

export const tabTriggerBase: React.CSSProperties = {
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

export const tabTriggerMono: React.CSSProperties = {
  ...tabTriggerBase,
  fontFamily: "var(--ff-mono)",
  fontSize: "var(--ts-label)",
  fontWeight: 400,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

export const tabTriggerBody: React.CSSProperties = {
  ...tabTriggerBase,
  fontFamily: "var(--ff-body)",
  fontSize: "var(--ts-body)",
  fontWeight: 600,
};

export const tabActiveStyle: React.CSSProperties = {
  color: "var(--red)",
  borderBottomColor: "var(--red)",
  fontWeight: 600,
};
