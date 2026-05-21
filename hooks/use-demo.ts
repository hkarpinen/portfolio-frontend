import { useEffect, useState } from "react";

const DEMO_EXPIRES_AT_KEY = "demo_expires_at";

export function useIsDemo(): boolean {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(DEMO_EXPIRES_AT_KEY);
    if (!raw) return;
    setIsDemo(new Date(raw).getTime() > Date.now());
  }, []);

  return isDemo;
}
