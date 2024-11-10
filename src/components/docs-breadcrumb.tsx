"use client"

import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Home } from "lucide-react"

const ITEMS_TO_DISPLAY = 3

export function DocsBreadcrumb({ items, lang }: { items: { href?: string, label: string }[], lang: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbLink asChild>
          <Link href={`/${lang}`}>
            <Home className="h-4 w-4" />
          </Link>
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        {items.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger
                  className="flex items-center gap-1"
                  aria-label="Toggle menu"
                >
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {items.slice(0, -2).map((item, index) => (
                    <DropdownMenuItem key={item.label}>
                      <Link href={item.href ? item.href : "#"}>
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
          item.href ? (
            <div key={item.label} className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </div>
          ) : (
            <BreadcrumbItem key={item.label}>
              <BreadcrumbPage>
                {item.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
