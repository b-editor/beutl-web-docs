import Link from "next/link";
import type { ApiItem, GroupedMembers, MemberCategory } from "@/lib/api-docs/types";
import { formatTypeReference } from "@/lib/api-docs/parser";
import { TypeIcon } from "./type-icon";
import { cn } from "@/lib/utils";

interface MemberListProps {
  members: GroupedMembers;
  lang: string;
  className?: string;
}

interface MemberSectionProps {
  title: string;
  items: ApiItem[];
  lang: string;
}

function MemberSection({ title, items, lang }: MemberSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <MemberRow key={item.uid} item={item} lang={lang} />
        ))}
      </div>
    </div>
  );
}

function MemberRow({ item, lang }: { item: ApiItem; lang: string }) {
  const signature = item.syntax?.content || item.name;
  const returnType = item.syntax?.return?.type;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <TypeIcon type={item.type} className="mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${lang}/api-reference/${encodeURIComponent(item.uid)}`}
            className="font-mono text-sm font-medium hover:underline underline-offset-4 text-primary"
          >
            {item.name}
          </Link>
          {item.syntax?.parameters && item.syntax.parameters.length > 0 && (
            <span className="text-muted-foreground text-sm font-mono">
              ({item.syntax.parameters.map((p) => p.id).join(", ")})
            </span>
          )}
        </div>
        {returnType && (
          <div className="text-xs text-muted-foreground mt-1">
            Returns: <span className="font-mono">{formatTypeReference(returnType)}</span>
          </div>
        )}
        {item.summary && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.summary}
          </p>
        )}
      </div>
    </div>
  );
}

export function MemberList({ members, lang, className }: MemberListProps) {
  const sections: { key: MemberCategory; title: string; items: ApiItem[] }[] = [
    { key: "constructors", title: "Constructors", items: members.constructors },
    { key: "fields", title: "Fields", items: members.fields },
    { key: "properties", title: "Properties", items: members.properties },
    { key: "methods", title: "Methods", items: members.methods },
    { key: "events", title: "Events", items: members.events },
    { key: "operators", title: "Operators", items: members.operators },
  ];

  const hasAnyMembers = sections.some((s) => s.items.length > 0);

  if (!hasAnyMembers) {
    return null;
  }

  return (
    <div className={cn("mt-8", className)}>
      <h2 className="text-2xl font-bold mb-6">Members</h2>
      {sections.map((section) => (
        <MemberSection
          key={section.key}
          title={section.title}
          items={section.items}
          lang={lang}
        />
      ))}
    </div>
  );
}
