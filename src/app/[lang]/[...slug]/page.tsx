import { compileMDX } from 'next-mdx-remote/rsc'
import type { Metadata, ResolvingMetadata } from "next";
import type React from "react";
import type * as mdx from '@mdx-js/react';
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
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const runtime = 'edge';

type Props = {
  params: { slug: string[], lang: string }
  // searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params: { slug, lang } }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const frontmatter = await getFrontmatterFromSlug(lang, slug.map(i => decodeURIComponent(i)));

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

  for (const lang of ["en", "ja"]) {
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

const getComponents = (sourcePath: string): React.ComponentProps<typeof mdx.MDXProvider>['components'] => {
  return {
    a: (props) => {
      if (!props.href) {
        return <a {...props} />
      }

      return (
        <Link href={props.href} id={props.id} className={cn("text-text underline underline-offset-4", props.className)}>
          {props.children}
        </Link>
      )
    },

    img: (props) => {
      let src = props.src;
      if (!(src?.startsWith("https://") || src?.startsWith("http://")) && src) {
        src = new URL(src, `https://raw.githubusercontent.com/b-editor/beutl-docs/main/${sourcePath}`).toString();
      }

      if (src?.endsWith(".mp4") || src?.endsWith(".mov")) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return <video {...props as any} src={src} controls />
      }

      // biome-ignore lint/a11y/useAltText: <explanation>
      return <img {...props} src={src} />
    },

    h1: (props) => <h1 className="scroll-m-20 my-4 text-3xl font-extrabold tracking-tight lg:text-4xl" {...props} />,
    h2: (props) => <h2 className="scroll-m-20 my-4 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0" {...props} />,
    h3: (props) => <h3 className="scroll-m-20 my-4 text-xl font-semibold tracking-tight" {...props} />,
    h4: (props) => <h4 className="scroll-m-20 my-4 text-lg font-semibold tracking-tight" {...props} />,
    h5: (props) => <h5 className="scroll-m-20 my-4 text-base font-semibold tracking-tight" {...props} />,
    code: (props) => <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded" {...props} />,
    ol: (props) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
    ul: (props) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
    table: (props) => <table className="table-auto w-full my-6" {...props} />,
    tr: (props) => <tr className="m-0 border-t p-0 even:bg-muted/10" {...props} />,
    th: (props) => <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
    td: (props) => <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
  };
};

export default async function Page({
  params: { lang, slug } }
  : { params: { lang: string, slug: string[] } }
) {
  if (slug.length > 0 && slug[slug.length - 1].endsWith(".md")) {
    const last = slug[slug.length - 1];
    slug[slug.length - 1] = last.slice(0, last.length - 3);
    permanentRedirect(`/${lang}/${slug.join("/")}`, RedirectType.replace);
  }

  const decodedSlug = slug.map(i => decodeURIComponent(i));
  const mdsource = await getContentFromSlug(lang, decodedSlug);
  const [breadcrumbs, frontmatter, toc] = await Promise.all([getAncestorsFromSlug(lang, decodedSlug), getFrontmatterFromSlug(lang, decodedSlug), getTableOfContents(lang, decodedSlug)])
  let content: React.ReactElement | undefined;

  if (mdsource) {
    content = (await compileMDX({
      source: mdsource.content,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [
            remarkGfm,
            [remarkGitHub, remarkGitHubConfig],
          ],
          rehypePlugins: [
            rehypeSlug,
            rehypeHighlight
          ]
        }
      },
      components: getComponents(mdsource.path)
    })).content;
  }

  if (!content || !mdsource) {
    notFound();
  }

  return (
    <MarkdownContainer
      lang={lang}
      breadcrumbs={breadcrumbs}
      content={content}
      title={frontmatter?.title}
      sourcePath={mdsource.path}
      toc={toc}
    />
  );
};
