"use client";

import { CircleAlert, CircleX, Info, Lightbulb, MessageSquareWarning } from "lucide-react";
import { createRoot } from 'react-dom/client';

export function renderCardIcon() {
  for (const item of document.querySelectorAll(".admonition-title")) {
    const r = createRoot(item);
    if (item.classList.contains("note")) {
      r.render(<Info className="w-8 h-8" />);
    } else if (item.classList.contains("tip")) {
      r.render(<Lightbulb className="w-8 h-8" />);
    } else if (item.classList.contains("important")) {
      r.render(<MessageSquareWarning className="w-8 h-8" />);
    } else if (item.classList.contains("warning")) {
      r.render(<CircleAlert className="w-8 h-8" />);
    } else if (item.classList.contains("caution")) {
      r.render(<CircleX className="w-8 h-8" />);
    }
  }
}
