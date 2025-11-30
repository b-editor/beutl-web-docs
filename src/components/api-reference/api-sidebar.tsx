"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import type { NamespaceInfo } from "@/lib/api-docs/types";
import { TypeIcon } from "./type-icon";
import { cn } from "@/lib/utils";

interface ApiSidebarProps {
  namespaces: NamespaceInfo[];
  lang: string;
  className?: string;
}

export function ApiSidebar({ namespaces, lang, className }: ApiSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNamespaces, setExpandedNamespaces] = useState<Set<string>>(
    new Set()
  );

  // Filter namespaces and types based on search
  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) {
      return namespaces;
    }

    const query = searchQuery.toLowerCase();
    return namespaces
      .map((ns) => ({
        ...ns,
        types: ns.types.filter(
          (type) =>
            type.name.toLowerCase().includes(query) ||
            type.uid.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (ns) =>
          ns.types.length > 0 || ns.name.toLowerCase().includes(query)
      );
  }, [namespaces, searchQuery]);

  // Auto-expand namespace containing current page
  const currentUid = decodeURIComponent(
    pathname.split("/api-reference/")[1] || ""
  );

  const toggleNamespace = (uid: string) => {
    setExpandedNamespaces((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  const isExpanded = (uid: string) => {
    return (
      expandedNamespaces.has(uid) ||
      (searchQuery.trim() !== "" &&
        filteredNamespaces.find((ns) => ns.uid === uid)?.types.length)
    );
  };

  return (
    <aside className={cn("w-64 flex-shrink-0", className)}>
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search API..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Namespace Tree */}
        <nav className="space-y-1">
          {filteredNamespaces.map((ns) => (
            <div key={ns.uid}>
              {/* Namespace Header */}
              <button
                type="button"
                onClick={() => toggleNamespace(ns.uid)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted/50 transition-colors",
                  currentUid === ns.uid && "bg-muted"
                )}
              >
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded(ns.uid) && "rotate-90"
                  )}
                />
                <TypeIcon type="Namespace" size={14} />
                <span className="font-medium truncate">{ns.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {ns.types.length}
                </span>
              </button>

              {/* Types List */}
              {isExpanded(ns.uid) && (
                <div className="ml-4 pl-2 border-l space-y-0.5 mt-1">
                  {ns.types.map((type) => {
                    const isActive = currentUid === type.uid;
                    return (
                      <Link
                        key={type.uid}
                        href={`/${lang}/api-reference/${encodeURIComponent(type.uid)}`}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-muted/50 transition-colors",
                          isActive && "bg-muted font-medium"
                        )}
                      >
                        <TypeIcon type={type.type} size={14} />
                        <span className="truncate">{type.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* No Results */}
        {searchQuery && filteredNamespaces.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    </aside>
  );
}
