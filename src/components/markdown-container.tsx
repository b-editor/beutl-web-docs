"use client";

import { useEffect, useMemo, useReducer } from "react";
import "@/styles/MarkdownComponents.css";
import "@/styles/github-markdown-dark.css";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import 'highlight.js/styles/github-dark.css';
import { useToc } from "@/hooks/use-toc";
import { renderCardIcon } from "@/lib/card-icon-renderer";
import type * as mdx from '@mdx-js/react';
import type { Toc, TocEntry } from "@stefanprobst/rehype-extract-toc";
import Image from "next/image";
import { DocsBreadcrumb } from "./docs-breadcrumb";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type MarkdownContainerProps = {
  content: React.ReactElement,
  sourcePath: string,
  breadcrumbs: { title: string, path: string }[],
  title: string | undefined,
  toc: Toc
}

function TocListItem({ toc }: { toc: TocEntry }) {
  return (
    <li className="toc-item">
      <a className="toc-link text-foreground/50" href={`#${toc.id}`}>{toc.value}</a>

      {toc.children && <ol className="toc-level">
        {toc.children.map(i => <TocListItem toc={i} key={i.id} />)}
      </ol>}
    </li>
  )
}

export function MarkdownContainer({ content: source, breadcrumbs, title, sourcePath, toc }: MarkdownContainerProps) {
  const [showMore, toggleShowMore] = useReducer(v => !v, false);
  const renderedBreadcrumbs = useMemo(() => {
    const here = {
      label: title || "",
      href: undefined
    };

    return [...breadcrumbs.map((v) => ({
      label: v.title,
      href: v.path
    })), here] as { label: string, href?: string }[];
  }, [breadcrumbs, title]);
  useToc();

  useEffect(() => {
    renderCardIcon();
  }, []);

  const tocMobile = useMemo(() => {
    return toc.flatMap(v => {
      const r = [v];
      if (v.children) {
        r.push(...v.children)
      }
      return r;
    });
  }, [toc]);
  const minDepth = useMemo(() => {
    let r = Number.MAX_SAFE_INTEGER;
    for (const v of toc) {
      r = Math.min(v.depth, r);
    }

    if (r === Number.MAX_SAFE_INTEGER) {
      r = 0;
    }
    return r;
  }, [toc]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className={cn(toc.length > 0 && "md:flex md:flex-nowrap")}>
        <div className={cn("p-4 mb-8", toc.length > 0 && "md:max-w-[80%] flex-1 box-border")}>
          <DocsBreadcrumb items={renderedBreadcrumbs} />

          <div className="markdownRoot">
            <h1 className="scroll-m-20 my-4 text-3xl font-extrabold tracking-tight lg:text-4xl">{title}</h1>

            {tocMobile.length > 0 &&
              <div className="md:hidden my-6">
                <p className="text-xl font-semibold tracking-tight">この記事の内容</p>
                <nav className={`toc ${showMore ? "showMore" : ""}`}>
                  <ol className="toc-level">
                    {tocMobile.map((item, i) =>
                      <li key={item.id}
                        style={{ marginLeft: (item.depth - minDepth) * 16 }}
                        className={cn(!showMore && i > 4 && "hidden", "my-1")}>
                        <Link href={`#${item.id}`} className="text-sm hover:underline underline-offset-4">
                          {item.value}
                        </Link>
                      </li>)}
                  </ol>
                </nav>

                {tocMobile.length > 4 && <Button
                  className="p-0 h-8 text-text"
                  variant="link"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleShowMore();
                  }}>
                  {!showMore ? `さらに${tocMobile.length - 4}個を表示` : "少なく表示"}
                </Button>}
              </div>}

            {source}
          </div>

          <a href={`https://github.com/b-editor/beutl-docs/blob/main/${sourcePath}`} className="flex rounded-lg border mt-8 p-4 gap-4 bg-secondary/20">
            <Image src="/img/github-color.svg" width={40} height={40} alt="GitHub Logo" className="invert" />
            <div>
              <p className="font-semibold">GitHubで表示</p>
              <p>
                この記事のソースはGitHubにあります。<br />
                改善点があればIssueやPull requestを開いてください。
              </p>
            </div>
          </a>
        </div>
        {toc.length > 0 && <div className="rightContainer max-md:hidden max-w-[20%] flex-[0,0,20%]">
          <div className="sticky top-28">
            <h3>この記事の内容</h3>

            <nav className="toc">
              <ol className="toc-level">
                {toc.map(i => <TocListItem toc={i} key={i.id} />)}
              </ol>
            </nav>
          </div>
        </div>}
      </div>
    </div>
  );
}