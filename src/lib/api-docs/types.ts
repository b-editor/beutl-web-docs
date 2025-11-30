/**
 * DocFX YML Type Definitions
 * Based on DocFX ManagedReference schema
 */

// Symbol types from DocFX
export type SymbolType =
  | "Namespace"
  | "Class"
  | "Struct"
  | "Interface"
  | "Enum"
  | "Delegate"
  | "Method"
  | "Property"
  | "Field"
  | "Event"
  | "Constructor"
  | "Operator";

// Programming languages supported
export type Language = "csharp" | "vb";

// Parameter definition
export interface Parameter {
  id: string;
  type: string;
  description?: string;
}

// Type parameter definition (generics)
export interface TypeParameter {
  id: string;
  description?: string;
}

// Return type definition
export interface ReturnType {
  type: string;
  description?: string;
}

// Syntax definition
export interface Syntax {
  content: string;
  "content.vb"?: string;
  parameters?: Parameter[];
  typeParameters?: TypeParameter[];
  return?: ReturnType;
}

// Source code reference
export interface SourceReference {
  href: string;
}

// API Item (class, method, property, etc.)
export interface ApiItem {
  uid: string;
  commentId: string;
  id: string;
  parent?: string;
  children?: string[];
  langs: Language[];
  name: string;
  nameWithType: string;
  fullName: string;
  type: SymbolType;
  source?: SourceReference;
  assemblies?: string[];
  namespace?: string;
  summary?: string;
  remarks?: string;
  example?: string;
  syntax?: Syntax;
  overload?: string;
  inheritance?: string[];
  derivedClasses?: string[];
  implements?: string[];
  inheritedMembers?: string[];
  extensionMethods?: string[];
  // For VB naming variations
  "nameWithType.vb"?: string;
  "fullName.vb"?: string;
  "name.vb"?: string;
}

// Reference to another API item
export interface ApiReference {
  uid: string;
  commentId?: string;
  parent?: string;
  isExternal?: boolean;
  href?: string;
  name: string;
  nameWithType: string;
  fullName: string;
  "spec.csharp"?: SpecPart[];
  "spec.vb"?: SpecPart[];
}

// Spec part for generic types display
export interface SpecPart {
  uid?: string;
  name: string;
  isExternal?: boolean;
  href?: string;
}

// Full YML file structure
export interface ApiDocument {
  items: ApiItem[];
  references?: ApiReference[];
}

// TOC (Table of Contents) entry
export interface TocEntry {
  uid?: string;
  name: string;
  href?: string;
  items?: TocEntry[];
}

// Parsed namespace with its types
export interface NamespaceInfo {
  uid: string;
  name: string;
  types: TypeInfo[];
}

// Simplified type info for navigation
export interface TypeInfo {
  uid: string;
  name: string;
  type: SymbolType;
  namespace: string;
}

// Search result
export interface SearchResult {
  uid: string;
  name: string;
  fullName: string;
  type: SymbolType;
  namespace?: string;
}

// Member categories for display
export type MemberCategory =
  | "constructors"
  | "fields"
  | "properties"
  | "methods"
  | "events"
  | "operators";

// Grouped members for type display
export interface GroupedMembers {
  constructors: ApiItem[];
  fields: ApiItem[];
  properties: ApiItem[];
  methods: ApiItem[];
  events: ApiItem[];
  operators: ApiItem[];
}
