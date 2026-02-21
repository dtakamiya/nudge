import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full animate-fade-in-up">
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">ページが見つかりません</h2>
            <p className="text-sm text-muted-foreground mt-1">
              お探しのページは存在しないか、移動した可能性があります。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">ダッシュボードに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
