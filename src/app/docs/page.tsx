import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="bg-card">
        <div className="max-w-4xl mx-auto md:justify-center lg:justify-between items-center flex gap-16 max-md:mx-0">
          <div className="py-14 px-7">
            <h1 className="text-4xl font-bold">Beutl Docs</h1>
            <h2 className="text-xl mt-2">ユーザー/開発者向け</h2>
            <div className="flex gap-2 mt-4">
              <Button asChild>
                <Link href="/docs/get-started">
                  スタート
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
              <CardTitle>スタート</CardTitle>
              <CardDescription>初心者向け</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="pl-6 list-disc">
                <li><Link href="/docs/get-started/install">インストール</Link></li>
                <li><Link href="/docs/get-started/create-project">プロジェクトを作成</Link></li>
                <li><Link href="/docs/get-started/project-structure">プロジェクトの構成</Link></li>
                <li><Link href="/docs/get-started/add-element">要素の追加</Link></li>
                <li><Link href="/docs/get-started/edit-element">要素の編集</Link></li>
                <li><Link href="/docs/get-started/keyframe">キーフレーム</Link></li>
                <li><Link href="/docs/get-started/encode">エンコード</Link></li>
                <li><Link href="/docs/get-started/notes">注意事項</Link></li>
              </ul>
            </CardContent>
          </Card>
          <Card className="md:basis-1/2">
            <CardHeader>
              <CardTitle>高度なドキュメント</CardTitle>
              <CardDescription>開発者向け</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="pl-6 list-disc">
                <li><Link href="/docs/advanced/rendering-process">レンダリングプロセス</Link></li>
                <li><Link href="/docs/advanced/source-operator">ソース操作</Link></li>
                <li><Link href="/docs/advanced/filter-effect">エフェクト</Link></li>
                <li><Link href="/docs/advanced/render-cache">キャッシュ</Link></li>
                <li><Link href="/docs/advanced/supported-types-by-property-editor">プロパティエディタが対応している型</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
