import type { ApiItem, GroupedMembers } from "@/lib/api-docs/types";
import { TypeIcon, getTypeBadgeColor } from "./type-icon";
import { SyntaxBlock } from "./syntax-block";
import { InheritanceTree } from "./inheritance-tree";
import { MemberList } from "./member-list";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TypeViewProps {
  item: ApiItem;
  members: GroupedMembers;
  lang: string;
}

export function TypeView({ item, members, lang }: TypeViewProps) {
  return (
    <article className="max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TypeIcon type={item.type} size={24} />
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-md border",
              getTypeBadgeColor(item.type)
            )}
          >
            {item.type}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">{item.name}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {item.namespace && (
            <div>
              <span className="font-medium">Namespace:</span>{" "}
              <Link
                href={`/${lang}/api-reference/${encodeURIComponent(item.namespace)}`}
                className="hover:underline underline-offset-4"
              >
                {item.namespace}
              </Link>
            </div>
          )}
          {item.assemblies && item.assemblies.length > 0 && (
            <div>
              <span className="font-medium">Assembly:</span>{" "}
              {item.assemblies.join(", ")}
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {item.summary && (
        <section className="mb-8">
          <p className="text-lg leading-relaxed">{item.summary}</p>
        </section>
      )}

      {/* Syntax */}
      {item.syntax && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Definition</h2>
          <SyntaxBlock
            csharp={item.syntax.content}
            vb={item.syntax["content.vb"]}
          />
        </section>
      )}

      {/* Type Parameters (for generic types) */}
      {item.syntax?.typeParameters && item.syntax.typeParameters.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Type Parameters</h2>
          <div className="space-y-3">
            {item.syntax.typeParameters.map((tp) => (
              <div key={tp.id} className="flex items-start gap-3">
                <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                  {tp.id}
                </code>
                {tp.description && (
                  <p className="text-muted-foreground">{tp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inheritance */}
      <InheritanceTree
        inheritance={item.inheritance}
        implements={item.implements}
        derivedClasses={item.derivedClasses}
        currentUid={item.uid}
        lang={lang}
        className="mb-8 p-4 rounded-lg bg-muted/30"
      />

      {/* Remarks */}
      {item.remarks && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Remarks</h2>
          <div className="prose dark:prose-invert max-w-none">
            {item.remarks}
          </div>
        </section>
      )}

      {/* Members */}
      <MemberList members={members} lang={lang} />

      {/* Source Link */}
      {item.source?.href && (
        <section className="mt-8 pt-8 border-t">
          <a
            href={item.source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            View source on GitHub
          </a>
        </section>
      )}
    </article>
  );
}
