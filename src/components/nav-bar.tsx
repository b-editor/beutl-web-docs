import Link from "next/link";
import { StandardDrawer } from "./drawer";
import { NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import type { Entry } from "@/lib/docs-fetcher";
import { t } from "i18next";

export default async function NavBar({ rootEntry, lang }: { rootEntry: Entry, lang: string }) {
  return (
    <nav className="py-2 px-2 md:px-[52px] gap-2 flex sticky top-0 w-full items-center justify-between border-b bg-background z-20">
      <div className="gap-2 flex">
        <StandardDrawer rootEntry={rootEntry} lang={lang} />

        <Link className="decoration-0 flex gap-2 my-auto" href={`/${lang}`}>
          <img className='align-bottom' src="/img/logo_dark.svg" alt="Logo" />
          <h1 className="font-semibold text-xl mt-1">Beutl</h1>
        </Link>
      </div>

      <div>
        <NavigationMenuPrimitive.Root
          className={cn(
            "relative z-10 flex max-w-max flex-1 items-center justify-center",
          )}
        >
          <NavigationMenuList>
            <Link href="/docs/get-started" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "max-md:hidden")}>
                {t("start")}
              </NavigationMenuLink>
            </Link>
            <Link href="/docs/extensions" legacyBehavior passHref className="max-sm:hidden">
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "max-md:hidden")}>
                {t("extensions")}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuList>

          <div className={cn("absolute right-0 top-full flex justify-center")}>
            <NavigationMenuPrimitive.Viewport
              className={cn(
                "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
              )}
            />
          </div>

        </NavigationMenuPrimitive.Root>
      </div>
    </nav>
  )
}