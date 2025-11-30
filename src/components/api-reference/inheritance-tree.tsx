import Link from "next/link";
import { isExternalType } from "@/lib/api-docs/parser";
import { cn } from "@/lib/utils";

interface InheritanceTreeProps {
  inheritance?: string[];
  implements?: string[];
  derivedClasses?: string[];
  currentUid: string;
  lang: string;
  className?: string;
}

function TypeLink({
  uid,
  lang,
  isCurrent = false,
}: {
  uid: string;
  lang: string;
  isCurrent?: boolean;
}) {
  const displayName = uid.split(".").pop() || uid;
  const isExternal = isExternalType(uid);

  if (isExternal) {
    // External types link to Microsoft docs
    const msDocsUrl = `https://learn.microsoft.com/dotnet/api/${uid.toLowerCase()}`;
    return (
      <a
        href={msDocsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
      >
        {displayName}
      </a>
    );
  }

  if (isCurrent) {
    return (
      <span className="font-mono text-sm font-bold text-foreground">
        {displayName}
      </span>
    );
  }

  return (
    <Link
      href={`/${lang}/api-reference/${encodeURIComponent(uid)}`}
      className="font-mono text-sm text-primary hover:underline underline-offset-4"
    >
      {displayName}
    </Link>
  );
}

export function InheritanceTree({
  inheritance,
  implements: implementsList,
  derivedClasses,
  currentUid,
  lang,
  className,
}: InheritanceTreeProps) {
  const hasInheritance = inheritance && inheritance.length > 0;
  const hasImplements = implementsList && implementsList.length > 0;
  const hasDerived = derivedClasses && derivedClasses.length > 0;

  if (!hasInheritance && !hasImplements && !hasDerived) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {hasInheritance && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Inheritance
          </h3>
          <div className="flex items-center flex-wrap gap-1">
            {inheritance.map((uid, index) => (
              <span key={uid} className="flex items-center">
                <TypeLink uid={uid} lang={lang} />
                {index < inheritance.length - 1 && (
                  <span className="mx-2 text-muted-foreground">→</span>
                )}
              </span>
            ))}
            <span className="mx-2 text-muted-foreground">→</span>
            <TypeLink uid={currentUid} lang={lang} isCurrent />
          </div>
        </div>
      )}

      {hasImplements && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Implements
          </h3>
          <div className="flex flex-wrap gap-2">
            {implementsList.map((uid) => (
              <span
                key={uid}
                className="px-2 py-1 rounded-md bg-muted/50 text-sm"
              >
                <TypeLink uid={uid} lang={lang} />
              </span>
            ))}
          </div>
        </div>
      )}

      {hasDerived && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Derived Classes
          </h3>
          <div className="flex flex-wrap gap-2">
            {derivedClasses.slice(0, 10).map((uid) => (
              <span
                key={uid}
                className="px-2 py-1 rounded-md bg-muted/50 text-sm"
              >
                <TypeLink uid={uid} lang={lang} />
              </span>
            ))}
            {derivedClasses.length > 10 && (
              <span className="px-2 py-1 text-sm text-muted-foreground">
                +{derivedClasses.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
