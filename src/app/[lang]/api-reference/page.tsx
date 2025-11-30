import type { Metadata } from "next";
import Link from "next/link";
import { getNamespaces } from "@/lib/api-docs";
import { TypeIcon } from "@/components/api-reference";

export const metadata: Metadata = {
  title: "API Reference - Beutl",
  description: "Beutl API Reference Documentation",
};

interface PageProps {
  params: { lang: string };
}

export default async function ApiReferencePage({ params: { lang } }: PageProps) {
  const namespaces = await getNamespaces();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">API Reference</h1>
        <p className="text-lg text-muted-foreground">
          Browse the Beutl API documentation. Select a namespace below to explore
          the available types and members.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Namespaces</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {namespaces.map((ns) => (
            <Link
              key={ns.uid}
              href={`/${lang}/api-reference/${encodeURIComponent(ns.uid)}`}
              className="block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <TypeIcon type="Namespace" size={20} />
                <h3 className="font-semibold font-mono">{ns.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {ns.types.length} type{ns.types.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mt-12 p-6 rounded-lg bg-muted/30">
        <h2 className="text-lg font-semibold mb-4">API Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{namespaces.length}</div>
            <div className="text-sm text-muted-foreground">Namespaces</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {namespaces.reduce((sum, ns) => sum + ns.types.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Types</div>
          </div>
        </div>
      </section>
    </div>
  );
}
