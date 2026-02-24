"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KEYBOARD_SHORTCUTS, type ShortcutContext } from "@/hooks/use-keyboard-shortcuts";

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly context?: ShortcutContext;
};

function ShortcutRow({ keyLabel, description }: { keyLabel: string; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt>
        <kbd
          role="term"
          className="inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 font-mono text-sm font-medium text-muted-foreground"
        >
          {keyLabel}
        </kbd>
      </dt>
      <dd className="text-sm text-foreground">{description}</dd>
    </div>
  );
}

export function ShortcutHelpDialog({ open, onClose, context }: Props) {
  const globalShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.context === "global");
  const recordingShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.context === "recording");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-semibold tracking-tight">
            キーボードショートカット
          </DialogTitle>
          <DialogDescription>利用可能なキーボードショートカット一覧</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              グローバル
            </p>
            <dl className="space-y-3">
              {globalShortcuts.map(({ key, description }) => (
                <ShortcutRow key={key} keyLabel={key} description={description} />
              ))}
            </dl>
          </section>

          {(context === "recording" || context === undefined) && (
            <section>
              <p
                className={`mb-2 text-xs font-medium uppercase tracking-wider ${
                  context === "recording" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                記録中
              </p>
              <dl className="space-y-3">
                {recordingShortcuts.map(({ key, description }) => (
                  <ShortcutRow key={key} keyLabel={key} description={description} />
                ))}
              </dl>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
