import "server-only";
import { Octokit } from "@octokit/rest";
import { matter } from 'vfile-matter'
import { VFile } from 'vfile'
import { compile } from "@mdx-js/mdx";
import rehypeSlug from 'rehype-slug';
import rehypeToc, { type Toc } from "@stefanprobst/rehype-extract-toc"
import rehypeTocExport from "@stefanprobst/rehype-extract-toc/mdx"
import remarkFrontmatter from "remark-frontmatter";

const DefaultParams = {
  owner: "b-editor",
  repo: "beutl-docs",
  ref: "main"
};

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
  request: {
    fetch: (url: string | URL | globalThis.Request, options?: RequestInit) => {
      return fetch(url, { ...options });
    }
  }
});

function getDefaultTitle(pathOrSlug: string | string[]) {
  let slug: string[];
  if (typeof pathOrSlug === "string") {
    slug = pathOrSlug.split("/");
  } else {
    slug = pathOrSlug;
  }

  if (Array.isArray(slug)) {
    if (slug.length > 0) {
      let last = slug[slug.length - 1];
      if (last.endsWith(".md")) {
        last = last.slice(0, last.length - 3);
      }

      if (last.length > 2) {
        let num = "";
        let i = 0;
        for (; i < last.length; i++) {
          const c = last[i];
          if (c === ".") {
            break;
          }
          num += c;
        }
        // ここで`i`は`.`のindex
        const order = last.slice(0, i);
        // 数値が有効な場合、切り取る
        if (!Number.isNaN(Number.parseInt(order))) {
          last = last.slice(i + 1);
        }
      }

      return last;
    }
  }

  return `Unknown title (url: ${Array.isArray(slug) ? slug.join("/") : slug})`;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function getFrontmatterFronPath(path: string): Promise<any> {
  try {
    const result = (await octokit.rest.repos.getContent({ ...DefaultParams, path: path, mediaType: { format: "raw" } }));
    if (result.status === 200 && typeof result.data === "string") {
      const file = new VFile(result.data as string);
      matter(file);

      return file.data.matter;
    }
  } catch (ex) {
  }

  return { type: "ignore" };
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getFrontmatterFromContent(content: string): any {
  try {
    const file = new VFile(content);
    matter(file);

    return file.data.matter;
  } catch {
    return { type: "ignore" };
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function getFrontmatterFromSlug(lang: string, slug: string[]): Promise<any> {
  try {
    const result = await getContentFromSlug(lang, slug);

    if (result) {
      const file = new VFile(result.content);
      matter(file);

      return file.data.matter;
    }
  } catch {
  }

  return { type: "ignore" };
}

export async function getAncestersFromSlug(lang: string, slug: string[]) {
  const items: { title: string, path: string }[] = [];

  for (let i = 0; i < slug.length - 1; i++) {
    try {
      const joined = slug.slice(0, i + 1).join("/");
      const path = `${lang}/${joined}/README.md`;
      const f = await getFrontmatterFronPath(path);

      if (f.title) {
        items.push({
          title: f.title,
          path: `/${lang}/${joined}`
        });
      }
    } catch (err) {
      // console.log("Error getAncestersFromSlug");
    }
  }

  return items;
};

type Resolver = (lang: string, slug: string[]) => Promise<{ content: string, path: string } | undefined>;

// slug = ["get-started", "create-project"]
const Resolvers: Resolver[] = [
  // "ja/get-started"を調べた後
  // ".create-project.md"で終わるコンテンツまたは、"create-project.md"に一致するコンテンツを取得
  async (lang, slug) => {
    // console.log("Start resolver1");
    if (slug.length >= 1) {
      let path = slug.length === 1 ? lang : `${lang}/${slug.slice(0, slug.length - 1).join("/")}`;
      const fileName1 = `${slug[slug.length - 1]}.md`;
      const fileName2 = `.${fileName1}`;
      // console.log(`fileName2: ${fileName1}`);
      // console.log(`fileName2: ${fileName2}`);

      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let result: any | undefined;
        const directory = await octokit.rest.repos.getContent({ ...DefaultParams, path: path });
        if (Array.isArray(directory.data)) {
          for (const item of directory.data) {
            if (item.type === "file"
              && ((item.name as string).endsWith(fileName2)
                || (item.name as string) === fileName1)
            ) {
              result = await octokit.rest.repos.getContent({ ...DefaultParams, path: item.path, mediaType: { format: "raw" } });
              path = item.path;
              break;
            }
          }
        }

        if (result && result.status === 200 && typeof result.data === "string") {
          return { content: result.data as string, path };
        }
      } catch (err) {
        // console.log("Error resolver1");
        // console.log(err);
        return undefined;
      }
    }
  },
  // "ja/get-started/create-project"を探索
  // Arrayの場合、READMEに置き換え
  async (lang, slug) => {
    // console.log("Start resolver2");
    try {
      let path = `${lang}/${slug.join("/")}`;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = await octokit.rest.repos.getContent({ ...DefaultParams, path: path });

      if (result.status === 200) {
        if (Array.isArray(result.data)) {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const readme = Array.from(result.data as any[]).find(s => s.name === "README.md");
          result = await octokit.rest.repos.getContent({ ...DefaultParams, path: readme.path });
          path = readme.path;
        }

        if (result.data.type === "file") {
          if (result.data.encoding === "base64") {
            const decoded_utf8str = atob(result.data.content);
            const decoded_array = new Uint8Array(decoded_utf8str.split("").map(c => c.charCodeAt(0)));
            const decoded = new TextDecoder().decode(decoded_array);

            return {
              content: decoded,
              path
            };
          }
          if (result.data.encoding === "none") {
            const content = await octokit.rest.repos.getContent({ ...DefaultParams, path: result.data.path, mediaType: { format: "raw" } });
            if (typeof content.data === "string") {
              return {
                content: content.data as string,
                path: result.data.path
              };
            }
          }
        }
      }
    } catch (err) {
      // console.log("Error resolver2");
    }
  },
];

export async function getContentFromSlug(lang: string, slug: string[]): Promise<{ content: string, path: string } | undefined> {
  for (const resolver of Resolvers) {
    try {
      const result = await resolver(lang, slug);
      if (result) {
        const frontmatter = getFrontmatterFromContent(result.content);
        if (frontmatter?.type === "ignore") {
          return undefined;
        }
        if (frontmatter?.type === "auto") {
          // README.mdの場合、
          //  INDEXを作成
          // それ以外の場合、
          //  タイトルと説明を載せたものを作成

          const ending = "/README.md";
          if (result.path.endsWith(ending)) {
            const entry = await getAllEntries(lang, result.path.slice(0, result.path.length - ending.length), false);

            return {
              content: `---
${Object.keys(frontmatter).map(k => `${k}: ${frontmatter[k]}`).join("\n")}
---
${frontmatter.description ?? ""}

${entry.children.map(i => `- [${i.title}](/docs${i.path})`).join("\n")}`,
              path: result.path
            };
          }

          return {
            content: frontmatter.description ?? "",
            path: result.path
          };
        }

        return result;
      }
    }
    catch (err) {
    }
  }

  return undefined;
};

export type Entry = {
  title: string,

  // "/docs/**/*" のURL
  path: string,

  children: Entry[]
};

// ja/xxxx/1.yyyy.md -> /xxxx/yyyy
// (ja/xxxx/README.md -> /xxxx) 呼び出しもとで解決されるはず
// "ja" -> "/"
export function normalizePath(lang: string, path: string) {
  if (path === lang)
    return "/";

  let path_ = path;
  if (path.startsWith(`${lang}/`)) {
    path_ = path.slice(2);
  }

  const README_MD = "README.md";
  if (path_.endsWith(README_MD)) {
    return path_.slice(0, path_.length - README_MD.length - 1);
  }

  if (path_.endsWith(".md")) {
    path_ = path_.slice(0, path_.length - 3);
  }

  const lastSeparatorIdx = path_.lastIndexOf("/");
  if (lastSeparatorIdx > 0 && path_.length > lastSeparatorIdx + 2) {
    let num = "";
    let i = lastSeparatorIdx + 1;
    for (; i < path_.length; i++) {
      const c = path_[i];
      if (c === ".") {
        break;
      }
      num += c;
    }
    // ここで`i`は`.`のindex
    const order = path_.slice(lastSeparatorIdx + 1, i);
    // 数値が有効な場合、切り取る
    if (!Number.isNaN(Number.parseInt(order))) {
      let tmp = path_.slice(0, lastSeparatorIdx + 1);
      tmp += path_.slice(i + 1);
      path_ = tmp;
    }
  }

  return path_;
}

export async function getAllEntries(lang: string, path?: string | undefined, recursive = true): Promise<Entry> {
  let path_ = path;
  path_ ??= lang;
  let title: string | undefined;
  const children: Entry[] = [];

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const root: any = await octokit.rest.repos.getContent({ ...DefaultParams, path: path_ });
  if (Array.isArray(root.data)) {
    for (const item of root.data) {
      if (item.name.startsWith("_")) {
        continue;
      }

      if (item.type === "file") {
        if (item.name === "README.md") {
          title = (await getFrontmatterFronPath(item.path)).title;
          continue;
        }

        try {
          const f = await getFrontmatterFronPath(item.path);
          if (f.type !== "ignore") {
            children.push({
              title: f.title,
              path: normalizePath(lang, item.path),
              children: []
            });
          }
        }
        catch {
        }
      }
      else if (item.type === "dir" && recursive) {
        children.push(await getAllEntries(lang, item.path));
      }
    }
  }

  title ??= getDefaultTitle(path_);

  const entry = {
    title: title,
    children: children,
    path: normalizePath(lang, path_),
  };

  return entry;
}

export async function getTableOfContents(lang: string, slug: string[]): Promise<Toc> {
  try {
    const result = await getContentFromSlug(lang, slug);
    if (result) {
      const file = await compile(result.content, {
        remarkPlugins: [
          remarkFrontmatter
        ],
        rehypePlugins: [
          rehypeSlug,
          rehypeToc,
          [rehypeTocExport, { name: "toc" }]
        ]
      });

      return file.data.toc as Toc;
    }
  } catch {
  }

  return [];
}