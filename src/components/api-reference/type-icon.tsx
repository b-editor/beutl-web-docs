import {
  Box,
  Circle,
  Square,
  List,
  ArrowRight,
  Zap,
  Hash,
  Settings,
  Folder,
  FileCode,
  Plus,
  Percent,
  type LucideIcon,
} from "lucide-react";
import type { SymbolType } from "@/lib/api-docs/types";
import { cn } from "@/lib/utils";

interface TypeIconProps {
  type: SymbolType;
  className?: string;
  size?: number;
}

const iconMap: Record<SymbolType, LucideIcon> = {
  Namespace: Folder,
  Class: Box,
  Struct: Square,
  Interface: Circle,
  Enum: List,
  Delegate: ArrowRight,
  Method: FileCode,
  Property: Settings,
  Field: Hash,
  Event: Zap,
  Constructor: Plus,
  Operator: Percent,
};

const colorMap: Record<SymbolType, string> = {
  Namespace: "text-amber-500",
  Class: "text-blue-500",
  Struct: "text-green-500",
  Interface: "text-purple-500",
  Enum: "text-orange-500",
  Delegate: "text-pink-500",
  Method: "text-cyan-500",
  Property: "text-indigo-500",
  Field: "text-gray-500",
  Event: "text-yellow-500",
  Constructor: "text-emerald-500",
  Operator: "text-red-500",
};

export function TypeIcon({ type, className, size = 16 }: TypeIconProps) {
  const Icon = iconMap[type] || FileCode;
  const color = colorMap[type] || "text-gray-500";

  return <Icon className={cn(color, className)} size={size} />;
}

export function getTypeLabel(type: SymbolType): string {
  return type;
}

export function getTypeBadgeColor(type: SymbolType): string {
  const colors: Record<SymbolType, string> = {
    Namespace: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Struct: "bg-green-500/10 text-green-500 border-green-500/20",
    Interface: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Enum: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Delegate: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    Method: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    Property: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    Field: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    Event: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Constructor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Operator: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return colors[type] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
}
