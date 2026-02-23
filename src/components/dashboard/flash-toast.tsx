"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const MAX_NAME_LENGTH = 100;

export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deleted = searchParams.get("deleted");

  useEffect(() => {
    if (deleted && deleted.length <= MAX_NAME_LENGTH) {
      toast.success(`${deleted} を削除しました`);
      router.replace("/");
    }
  }, [deleted, router]);

  return null;
}
