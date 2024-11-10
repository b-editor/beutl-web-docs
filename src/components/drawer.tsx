import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import type { Entry } from "@/lib/docs-fetcher";
import { type TreeDataItem, TreeView } from "./tree-view";

function convertToTreeDataItem(entry: Entry, lang: string): TreeDataItem {
  return {
    id: entry.path,
    href: `/${lang}${entry.path}`,
    name: entry.title,
    children: entry.children.length > 0 ? entry.children.map((e) => convertToTreeDataItem(e, lang)) : undefined
  };
}

export function StandardDrawer({ rootEntry, lang }: { rootEntry: Entry, lang: string }) {
  const data = rootEntry.children.map((e) => convertToTreeDataItem(e, lang));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className='w-9 h-9' variant="ghost" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <div className='h-full flex flex-col'>
          <div className="">
            <SheetHeader>
              <SheetTitle className='flex gap-2'>
                <img className='align-bottom ml-2' src="/img/logo_dark.svg" alt="Logo" />
                <p className='font-semibold text-xl mt-1'>Beutl</p>
              </SheetTitle>
            </SheetHeader>

            <TreeView className="pt-4" data={data} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
