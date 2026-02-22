"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ShortcutEntry = {
  readonly key: string;
  readonly description: string;
};

const SHORTCUTS: ReadonlyArray<ShortcutEntry> = [
  { key: "n", description: "新規メンバーを追加" },
  { key: "m", description: "新規ミーティングを作成" },
  { key: "⌘ K", description: "検索" },
  { key: "?", description: "ショートカット一覧を表示" },
];

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export function ShortcutHelpDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-semibold tracking-tight">
            キーボードショートカット
          </DialogTitle>
          <DialogDescription>利用可能なキーボードショートカット一覧</DialogDescription>
        </DialogHeader>
        <dl className="space-y-3">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <dt>
                <kbd
                  role="term"
                  className="inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 font-mono text-sm font-medium text-muted-foreground"
                >
                  {key}
                </kbd>
              </dt>
              <dd className="text-sm text-foreground">{description}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
