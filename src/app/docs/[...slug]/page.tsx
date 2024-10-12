import { serialize } from 'next-mdx-remote/serialize'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { Metadata, ResolvingMetadata } from "next";
import React from "react";
import remarkGitHub from 'remark-github-beta-blockquote-admonitions'
import rehypeSlug from 'rehype-slug';
import {
  type Entry,
  getAllEntries,
  getAncestersFromSlug as getAncestorsFromSlug,
  getContentFromSlug,
  getFrontmatterFromSlug,
  getTableOfContents
} from "@/lib/docs-fetcher";
import { MarkdownContainer } from "@/components/markdown-container";
import { RedirectType, notFound, permanentRedirect } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import rehypeHighlight, { Options as HighlightOptions } from 'rehype-highlight';
import highlightJson from 'highlight.js/lib/languages/json';
import highlightCS from 'highlight.js/lib/languages/csharp';
import highlightXml from 'highlight.js/lib/languages/xml';
import { common } from 'lowlight';

type Props = {
  params: { slug: string[], lang: string }
  // searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params: { slug } }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const frontmatter = await getFrontmatterFromSlug("ja", slug.map(i => decodeURIComponent(i)));

  return {
    title: frontmatter.title,
    description: frontmatter.description
  }
}

const getClassNames = (defaultClassName: string, title: string): string | string[] => {
  let intent: string | undefined;
  if (title === "NOTE") {
    intent = "note";
  } else if (title === "TIP") {
    intent = "tip";
  } else if (title === "IMPORTANT") {
    intent = "important";
  } else if (title === "WARNING") {
    intent = "warning";
  } else if (title === "CAUTION") {
    intent = "caution";
  }

  if (intent) {
    return [defaultClassName, intent];
  }
  return defaultClassName;
};
const remarkGitHubConfig = {
  classNameMaps: {
    block: (title: string) => getClassNames("admonition", title),
    title: (title: string) => getClassNames("admonition-title", title)
  },
  titleFilter: ["[!NOTE]", "[!TIP]", "[!IMPORTANT]", "[!WARNING]", "[!CAUTION]"],
};

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  let params: { slug: string[] }[] = [];

  for (const lang of ["ja"]) {
  // for (const lang of ["en", "ja"]) {
    const entry = await getAllEntries(lang);
    const paths: string[] = [];
    const expand = (entry: Entry) => {
      paths.push(entry.path);
      for (const item of entry.children) {
        expand(item);
      }
    };
    expand(entry);

    const slugs: string[][] = [];
    for (const path of paths) {
      slugs.push(path.split("/").filter(i => i !== ""));
    }

    params = params.concat(
      slugs.filter(i => i.length !== 0)
        .map(i => ({
          slug: i,
          // lang
        }))
    );
  }

  return params;
}

export default async function Page({
  params: { slug } }
  : { params: { slug: string[] } }
) {
  if (slug.length > 0 && slug[slug.length - 1].endsWith(".md")) {
    const last = slug[slug.length - 1];
    slug[slug.length - 1] = last.slice(0, last.length - 3);
    permanentRedirect(`/docs/${slug.join("/")}`, RedirectType.replace);
  }

  const decodedSlug = slug.map(i => decodeURIComponent(i));
  const mdsource = await getContentFromSlug("ja", decodedSlug);
  const [breadcrumbs, frontmatter, toc] = await Promise.all([getAncestorsFromSlug("ja", decodedSlug), getFrontmatterFromSlug("ja", decodedSlug), getTableOfContents("ja", decodedSlug)])
  let source: MDXRemoteSerializeResult | undefined;

  if (mdsource) {
    source = await serialize(
      mdsource.content,
      {
        parseFrontmatter: true,
        mdxOptions: {
          useDynamicImport: false,
          remarkPlugins: [
            remarkGfm,
            [remarkGitHub, remarkGitHubConfig],
          ],
          rehypePlugins: [
            rehypeSlug,
            rehypeHighlight
          ]
        }
      });
  }

  if (!source || !mdsource) {
    notFound();
  }

  return (
    <MarkdownContainer
      breadcrumbs={breadcrumbs}
      source={source}
      title={frontmatter?.title}
      sourcePath={mdsource.path}
      toc={toc}
    />
  );
};
