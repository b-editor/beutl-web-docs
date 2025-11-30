import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import {
  getApiDocument,
  getMainItem,
  getMemberItems,
  groupMembers,
  getAllApiUids,
  getBreadcrumbs,
} from "@/lib/api-docs";
import { TypeView, NamespaceView } from "@/components/api-reference";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageProps {
  params: { lang: string; uid: string[] };
}

export async function generateMetadata(
  { params: { uid, lang } }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const uidString = uid.map((s) => decodeURIComponent(s)).join("/");
  const doc = await getApiDocument(uidString);
  const item = doc ? getMainItem(doc) : null;

  if (!item) {
    return {
      title: "Not Found - API Reference",
    };
  }

  return {
    title: `${item.name} - API Reference - Beutl`,
    description: item.summary || `${item.type} ${item.fullName}`,
  };
}

export async function generateStaticParams(): Promise<{ uid: string[]; lang: string }[]> {
  const uids = await getAllApiUids();
  const params: { uid: string[]; lang: string }[] = [];

  for (const lang of ["en", "ja"]) {
    for (const uid of uids) {
      params.push({
        uid: [uid],
        lang,
      });
    }
  }

  return params;
}

export default async function ApiDetailPage({ params: { lang, uid } }: PageProps) {
  const uidString = uid.map((s) => decodeURIComponent(s)).join("/");
  const doc = await getApiDocument(uidString);

  if (!doc) {
    notFound();
  }

  const item = getMainItem(doc);
  if (!item) {
    notFound();
  }

  const breadcrumbs = await getBreadcrumbs(uidString);
  const members = groupMembers(getMemberItems(doc));

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link
          href={`/${lang}/api-reference`}
          className="hover:text-foreground flex items-center gap-1"
        >
          <Home size={14} />
          API Reference
        </Link>
        {breadcrumbs.slice(0, -1).map((crumb, index) => (
          <span key={crumb.uid} className="flex items-center gap-1">
            <ChevronRight size={14} />
            <Link
              href={`/${lang}/api-reference/${encodeURIComponent(crumb.uid)}`}
              className="hover:text-foreground hover:underline underline-offset-4"
            >
              {crumb.name}
            </Link>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">
            {breadcrumbs[breadcrumbs.length - 1]?.name}
          </span>
        </span>
      </nav>

      {/* Content based on type */}
      {item.type === "Namespace" ? (
        <NamespaceView item={item} doc={doc} lang={lang} />
      ) : (
        <TypeView item={item} members={members} lang={lang} />
      )}
    </div>
  );
}
