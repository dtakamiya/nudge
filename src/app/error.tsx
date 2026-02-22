"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full animate-fade-in-up">
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">エラーが発生しました</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || "予期しないエラーが発生しました。"}
            </p>
          </div>
          <Button onClick={reset} variant="outline">
            もう一度試す
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
