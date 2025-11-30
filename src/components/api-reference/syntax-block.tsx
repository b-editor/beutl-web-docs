"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SyntaxBlockProps {
  csharp: string;
  vb?: string;
  className?: string;
}

export function SyntaxBlock({ csharp, vb, className }: SyntaxBlockProps) {
  const [activeTab, setActiveTab] = useState<"csharp" | "vb">("csharp");
  const hasVb = !!vb;

  return (
    <div className={cn("rounded-lg border bg-muted/30", className)}>
      {hasVb && (
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab("csharp")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "csharp"
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            C#
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vb")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "vb"
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            VB
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono">
          {activeTab === "csharp" ? csharp : vb}
        </code>
      </pre>
    </div>
  );
}
