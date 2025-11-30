import { parse } from "yaml";
import type {
  ApiDocument,
  ApiItem,
  ApiReference,
  TocEntry,
  NamespaceInfo,
  TypeInfo,
  GroupedMembers,
  SymbolType,
} from "./types";

/**
 * Parse a DocFX YML string into an ApiDocument
 */
export function parseApiDocument(ymlContent: string): ApiDocument {
  const parsed = parse(ymlContent);
  return {
    items: parsed.items || [],
    references: parsed.references || [],
  };
}

/**
 * Parse TOC YML string into TocEntry array
 */
export function parseToc(ymlContent: string): TocEntry[] {
  const parsed = parse(ymlContent);
  // TOC files have a different structure - items at root level
  if (Array.isArray(parsed)) {
    return parsed;
  }
  return parsed.items || [];
}

/**
 * Get the main item from an ApiDocument (usually the first item which is the type/namespace)
 */
export function getMainItem(doc: ApiDocument): ApiItem | undefined {
  return doc.items?.[0];
}

/**
 * Get all member items from an ApiDocument (excluding the main type)
 */
export function getMemberItems(doc: ApiDocument): ApiItem[] {
  if (!doc.items || doc.items.length <= 1) {
    return [];
  }
  return doc.items.slice(1);
}

/**
 * Group members by category (constructors, fields, properties, methods, events, operators)
 */
export function groupMembers(members: ApiItem[]): GroupedMembers {
  const groups: GroupedMembers = {
    constructors: [],
    fields: [],
    properties: [],
    methods: [],
    events: [],
    operators: [],
  };

  for (const member of members) {
    switch (member.type) {
      case "Constructor":
        groups.constructors.push(member);
        break;
      case "Field":
        groups.fields.push(member);
        break;
      case "Property":
        groups.properties.push(member);
        break;
      case "Method":
        groups.methods.push(member);
        break;
      case "Event":
        groups.events.push(member);
        break;
      case "Operator":
        groups.operators.push(member);
        break;
      default:
        // Unknown type, try to categorize by name pattern
        if (member.id?.startsWith("#ctor") || member.name?.includes("ctor")) {
          groups.constructors.push(member);
        } else {
          groups.methods.push(member);
        }
    }
  }

  return groups;
}

/**
 * Find a reference by uid
 */
export function findReference(
  doc: ApiDocument,
  uid: string
): ApiReference | undefined {
  return doc.references?.find((ref) => ref.uid === uid);
}

/**
 * Extract namespace hierarchy from TOC
 */
export function extractNamespaces(toc: TocEntry[]): NamespaceInfo[] {
  const namespaces: NamespaceInfo[] = [];

  function processEntry(entry: TocEntry, parentNamespace?: string): void {
    // Check if this is a namespace entry
    if (entry.uid && !entry.uid.includes(".") && entry.items) {
      // Top-level namespace
      const ns: NamespaceInfo = {
        uid: entry.uid,
        name: entry.name || entry.uid,
        types: [],
      };

      // Process children as types
      for (const child of entry.items) {
        if (child.uid) {
          ns.types.push({
            uid: child.uid,
            name: child.name || child.uid.split(".").pop() || child.uid,
            type: inferTypeFromUid(child.uid),
            namespace: entry.uid,
          });
        }
      }

      namespaces.push(ns);
    } else if (entry.items) {
      // Recursively process nested entries
      for (const child of entry.items) {
        processEntry(child, entry.uid);
      }
    }
  }

  for (const entry of toc) {
    processEntry(entry);
  }

  return namespaces;
}

/**
 * Infer type from uid pattern (heuristic)
 */
function inferTypeFromUid(uid: string): SymbolType {
  // Common patterns:
  // - I prefix usually means Interface
  // - Ends with Attribute means Class (attribute)
  // - Contains generic backtick usually means Class/Struct
  const name = uid.split(".").pop() || "";

  if (name.startsWith("I") && name.length > 1 && name[1] === name[1].toUpperCase()) {
    return "Interface";
  }

  return "Class"; // Default assumption
}

/**
 * Convert uid to URL-safe path
 */
export function uidToPath(uid: string): string {
  // Replace backticks (generics) and special chars
  return uid
    .replace(/`\d+/g, "") // Remove generic arity like `1, `2
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/,/g, "-") // Replace commas
    .replace(/\s/g, ""); // Remove spaces
}

/**
 * Convert path back to uid (for lookups)
 */
export function pathToUid(path: string): string {
  // The path might have been simplified, but the original uid is stored in the file
  return path;
}

/**
 * Get display name for a type (without namespace)
 */
export function getDisplayName(item: ApiItem): string {
  return item.name || item.uid.split(".").pop() || item.uid;
}

/**
 * Get fully qualified name
 */
export function getFullName(item: ApiItem): string {
  return item.fullName || item.nameWithType || item.uid;
}

/**
 * Format type reference for display (handles generics)
 */
export function formatTypeReference(
  typeRef: string,
  references?: ApiReference[]
): string {
  // Handle generic type notation like {T} or {``0}
  let formatted = typeRef
    .replace(/\{``(\d+)\}/g, "<T$1>") // Convert {``0} to <T0>
    .replace(/\{([^}]+)\}/g, "<$1>"); // Convert {TypeName} to <TypeName>

  return formatted;
}

/**
 * Check if a type is external (from .NET or other libraries)
 */
export function isExternalType(uid: string): boolean {
  return (
    uid.startsWith("System.") ||
    uid.startsWith("Microsoft.") ||
    uid.startsWith("System") ||
    !uid.startsWith("Beutl")
  );
}

/**
 * Get icon class/name for a symbol type
 */
export function getTypeIcon(type: SymbolType): string {
  const icons: Record<SymbolType, string> = {
    Namespace: "folder",
    Class: "box",
    Struct: "square",
    Interface: "circle",
    Enum: "list",
    Delegate: "arrow-right",
    Method: "function",
    Property: "settings",
    Field: "hash",
    Event: "zap",
    Constructor: "plus",
    Operator: "percent",
  };
  return icons[type] || "file";
}
