import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getTranslation } from "../i18n/server";

export default async function Home({params:{lang}}:{params:{lang:string}}) {
  const { t } = await getTranslation(lang);

  return (
    <>
      <div className="bg-card">
        <div className="max-w-4xl mx-auto md:justify-center lg:justify-between items-center flex gap-16 max-md:mx-0">
          <div className="py-14 px-7">
            <h1 className="text-4xl font-bold">Beutl Docs</h1>
            <h2 className="text-xl mt-2">{t("userDeveloper")}</h2>
            <div className="flex gap-2 mt-4">
              <Button asChild>
                <Link href={`/${lang}/docs/get-started`}>
                  {t("start")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/b-editor/beutl">
                  <img src="/img/github-color.svg" alt="GitHub" className="w-5 h-5 mr-2 invert" />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
          <Image
            width={300}
            height={300}
            className="pointer-events-none select-none my-auto max-md:hidden"
            alt="Logo"
            unoptimized
            src="/img/logo_skeleton.svg" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto my-12 px-6">
        <div className="flex gap-8 max-md:flex-wrap max-md:flex-col">
          <Card className="md:basis-1/2">
            <CardHeader>
              <CardTitle>{t("start")}</CardTitle>
              <CardDescription>{t("beginnerGuide")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="pl-6 list-disc">
                <li><Link href={`/${lang}/get-started/install`}>{t("titles.beginner.installation")}</Link></li>
                <li><Link href={`/${lang}/get-started/create-project`}>{t("titles.beginner.creatingProject")}</Link></li>
                <li><Link href={`/${lang}/get-started/project-structure`}>{t("titles.beginner.projectStructure")}</Link></li>
                <li><Link href={`/${lang}/get-started/add-element`}>{t("titles.beginner.addingElements")}</Link></li>
                <li><Link href={`/${lang}/get-started/edit-element`}>{t("titles.beginner.editingElements")}</Link></li>
                <li><Link href={`/${lang}/get-started/keyframe`}>{t("titles.beginner.keyframes")}</Link></li>
                <li><Link href={`/${lang}/get-started/encode`}>{t("titles.beginner.encoding")}</Link></li>
                <li><Link href={`/${lang}/get-started/notes`}>{t("titles.beginner.notes")}</Link></li>
              </ul>
            </CardContent>
          </Card>
          <Card className="md:basis-1/2">
            <CardHeader>
              <CardTitle>{t("advanced")}</CardTitle>
              <CardDescription>{t("developerGuide")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="pl-6 list-disc">
                <li><Link href={`/${lang}/advanced/rendering-process`}>{t("titles.advanced.renderingProcess")}</Link></li>
                <li><Link href={`/${lang}/advanced/source-operator`}>{t("titles.advanced.sourceOperations")}</Link></li>
                <li><Link href={`/${lang}/advanced/filter-effect`}>{t("titles.advanced.effects")}</Link></li>
                <li><Link href={`/${lang}/advanced/render-cache`}>{t("titles.advanced.caching")}</Link></li>
                <li><Link href={`/${lang}/advanced/supported-types-by-property-editor`}>{t("titles.advanced.supportedTypesInEditor")}</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
