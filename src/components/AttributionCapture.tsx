"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

export function AttributionCapture() {
  useEffect(() => {
    captureAttribution(new URL(window.location.href));
  }, []);
  return null;
}
