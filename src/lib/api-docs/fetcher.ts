import "server-only";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import {
  parseApiDocument,
  parseToc,
  getMainItem,
  getMemberItems,
  groupMembers,
  extractNamespaces,
} from "./parser";
import type {
  ApiDocument,
  ApiItem,
  TocEntry,
  NamespaceInfo,
  GroupedMembers,
  SearchResult,
} from "./types";

// Path to API reference data
const API_DATA_PATH = join(process.cwd(), "src/data/api-reference");

// Cache for loaded documents
const documentCache = new Map<string, ApiDocument>();
const tocCache: { data: TocEntry[] | null } = { data: null };
const namespaceCache: { data: NamespaceInfo[] | null } = { data: null };

/**
 * Get the filename for a uid
 */
function getFilename(uid: string): string {
  // Handle generic types - they use backtick notation in filenames
  // e.g., Beutl.CoreProperty`1 -> Beutl.CoreProperty-1.yml
  const filename = uid.replace(/`/g, "-") + ".yml";
  return filename;
}

/**
 * Load and parse a YML file by uid
 */
export async function getApiDocument(uid: string): Promise<ApiDocument | null> {
  // Check cache first
  if (documentCache.has(uid)) {
    return documentCache.get(uid)!;
  }

  try {
    const filename = getFilename(uid);
    const filepath = join(API_DATA_PATH, filename);
    const content = await readFile(filepath, "utf-8");
    const doc = parseApiDocument(content);

    // Cache the result
    documentCache.set(uid, doc);

    return doc;
  } catch (error) {
    console.error(`Failed to load API document for uid: ${uid}`, error);
    return null;
  }
}

/**
 * Get the main API item (type definition) for a uid
 */
export async function getApiItem(uid: string): Promise<ApiItem | null> {
  const doc = await getApiDocument(uid);
  if (!doc) return null;
  return getMainItem(doc) || null;
}

/**
 * Get grouped members for a type
 */
export async function getGroupedMembers(uid: string): Promise<GroupedMembers | null> {
  const doc = await getApiDocument(uid);
  if (!doc) return null;

  const members = getMemberItems(doc);
  return groupMembers(members);
}

/**
 * Load the Table of Contents
 */
export async function getToc(): Promise<TocEntry[]> {
  if (tocCache.data) {
    return tocCache.data;
  }

  try {
    const filepath = join(API_DATA_PATH, "toc.yml");
    const content = await readFile(filepath, "utf-8");
    const toc = parseToc(content);
    tocCache.data = toc;
    return toc;
  } catch (error) {
    console.error("Failed to load TOC", error);
    return [];
  }
}

/**
 * Get all namespaces with their types
 */
export async function getNamespaces(): Promise<NamespaceInfo[]> {
  if (namespaceCache.data) {
    return namespaceCache.data;
  }

  try {
    // Read all YML files and extract namespace info
    const files = await readdir(API_DATA_PATH);
    const namespaceMap = new Map<string, NamespaceInfo>();

    for (const file of files) {
      if (!file.endsWith(".yml") || file === "toc.yml" || file === ".manifest") {
        continue;
      }

      try {
        const filepath = join(API_DATA_PATH, file);
        const content = await readFile(filepath, "utf-8");
        const doc = parseApiDocument(content);
        const mainItem = getMainItem(doc);

        if (!mainItem) continue;

        // Handle namespace files
        if (mainItem.type === "Namespace") {
          if (!namespaceMap.has(mainItem.uid)) {
            namespaceMap.set(mainItem.uid, {
              uid: mainItem.uid,
              name: mainItem.name,
              types: [],
            });
          }
        }
        // Handle type files (Class, Interface, etc.)
        else if (mainItem.namespace) {
          let ns = namespaceMap.get(mainItem.namespace);
          if (!ns) {
            ns = {
              uid: mainItem.namespace,
              name: mainItem.namespace,
              types: [],
            };
            namespaceMap.set(mainItem.namespace, ns);
          }

          ns.types.push({
            uid: mainItem.uid,
            name: mainItem.name,
            type: mainItem.type,
            namespace: mainItem.namespace,
          });
        }
      } catch (e) {
        // Skip files that can't be parsed
        continue;
      }
    }

    // Sort namespaces and their types
    const namespaces = Array.from(namespaceMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (const ns of namespaces) {
      ns.types.sort((a, b) => a.name.localeCompare(b.name));
    }

    namespaceCache.data = namespaces;
    return namespaces;
  } catch (error) {
    console.error("Failed to get namespaces", error);
    return [];
  }
}

/**
 * Get all available API uids (for static generation)
 */
export async function getAllApiUids(): Promise<string[]> {
  try {
    const files = await readdir(API_DATA_PATH);
    const uids: string[] = [];

    for (const file of files) {
      if (!file.endsWith(".yml") || file === "toc.yml" || file === ".manifest") {
        continue;
      }

      // Convert filename back to uid
      // e.g., Beutl.CoreProperty-1.yml -> Beutl.CoreProperty`1
      const uid = file
        .replace(".yml", "")
        .replace(/-(\d+)$/g, "`$1");

      uids.push(uid);
    }

    return uids;
  } catch (error) {
    console.error("Failed to get all API uids", error);
    return [];
  }
}

/**
 * Search API items by name
 */
export async function searchApi(query: string): Promise<SearchResult[]> {
  const namespaces = await getNamespaces();
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  for (const ns of namespaces) {
    // Check namespace name
    if (ns.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        uid: ns.uid,
        name: ns.name,
        fullName: ns.name,
        type: "Namespace",
      });
    }

    // Check types in namespace
    for (const type of ns.types) {
      if (
        type.name.toLowerCase().includes(lowerQuery) ||
        type.uid.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          uid: type.uid,
          name: type.name,
          fullName: type.uid,
          type: type.type,
          namespace: ns.name,
        });
      }
    }
  }

  // Sort by relevance (exact matches first, then by name)
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === lowerQuery;
    const bExact = b.name.toLowerCase() === lowerQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, 50); // Limit results
}

/**
 * Get breadcrumb path for a uid
 */
export async function getBreadcrumbs(
  uid: string
): Promise<{ name: string; uid: string }[]> {
  const parts = uid.split(".");
  const breadcrumbs: { name: string; uid: string }[] = [];

  // Build namespace hierarchy
  let currentPath = "";
  for (let i = 0; i < parts.length - 1; i++) {
    currentPath = currentPath ? `${currentPath}.${parts[i]}` : parts[i];
    breadcrumbs.push({
      name: parts[i],
      uid: currentPath,
    });
  }

  // Add the final item
  breadcrumbs.push({
    name: parts[parts.length - 1],
    uid: uid,
  });

  return breadcrumbs;
}
