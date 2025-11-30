import Link from "next/link";
import type { ApiItem, ApiDocument } from "@/lib/api-docs/types";
import { TypeIcon, getTypeBadgeColor } from "./type-icon";
import { cn } from "@/lib/utils";

interface NamespaceViewProps {
  item: ApiItem;
  doc: ApiDocument;
  lang: string;
}

export function NamespaceView({ item, doc, lang }: NamespaceViewProps) {
  // Group children by type
  const children = item.children || [];

  // Get full info for each child from references or by uid pattern
  const childItems = children.map((childUid) => {
    const ref = doc.references?.find((r) => r.uid === childUid);
    return {
      uid: childUid,
      name: ref?.name || childUid.split(".").pop() || childUid,
      fullName: ref?.fullName || childUid,
    };
  });

  // Sort alphabetically
  childItems.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <article className="max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TypeIcon type="Namespace" size={24} />
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-md border",
              getTypeBadgeColor("Namespace")
            )}
          >
            Namespace
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">{item.name}</h1>

        {item.assemblies && item.assemblies.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Assembly:</span>{" "}
            {item.assemblies.join(", ")}
          </div>
        )}
      </header>

      {/* Summary */}
      {item.summary && (
        <section className="mb-8">
          <p className="text-lg leading-relaxed">{item.summary}</p>
        </section>
      )}

      {/* Types in this namespace */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Types</h2>
        <div className="grid gap-2">
          {childItems.map((child) => (
            <Link
              key={child.uid}
              href={`/${lang}/api-reference/${encodeURIComponent(child.uid)}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <TypeIcon type="Class" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm font-medium group-hover:underline underline-offset-4">
                  {child.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
