"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deleted = searchParams.get("deleted");

  useEffect(() => {
    if (deleted) {
      toast.success(`${deleted} を削除しました`);
      router.replace("/");
    }
  }, [deleted, router]);

  return null;
}
