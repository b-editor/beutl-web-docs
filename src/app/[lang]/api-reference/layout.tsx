import { getNamespaces } from "@/lib/api-docs";
import { ApiSidebar } from "@/components/api-reference";

interface LayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default async function ApiReferenceLayout({
  children,
  params: { lang },
}: LayoutProps) {
  const namespaces = await getNamespaces();

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <ApiSidebar namespaces={namespaces} lang={lang} />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
