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
    <div className="flex gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Sidebar - hidden on mobile */}
      <ApiSidebar namespaces={namespaces} lang={lang} className="hidden lg:block" />

      {/* Main Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
