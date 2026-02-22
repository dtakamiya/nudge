"use client";

import { useRouter } from "next/navigation";
import { useCallback,useState } from "react";

import { ShortcutHelpDialog } from "@/components/layout/shortcut-help-dialog";
import { NewMeetingDialog } from "@/components/meeting/new-meeting-dialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

type MemberItem = {
  readonly id: string;
  readonly name: string;
};

type Props = {
  readonly members: ReadonlyArray<MemberItem>;
};

export function KeyboardShortcutProvider({ members }: Props) {
  const router = useRouter();
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const handleNewMember = useCallback(() => {
    router.push("/members/new");
  }, [router]);

  const handleNewMeeting = useCallback(() => {
    setIsMeetingDialogOpen(true);
  }, []);

  const handleShowHelp = useCallback(() => {
    setIsHelpDialogOpen(true);
  }, []);

  useKeyboardShortcuts({
    onNewMember: handleNewMember,
    onNewMeeting: handleNewMeeting,
    onShowHelp: handleShowHelp,
  });

  return (
    <>
      <NewMeetingDialog
        open={isMeetingDialogOpen}
        onClose={() => setIsMeetingDialogOpen(false)}
        members={members}
      />
      <ShortcutHelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
    </>
  );
}
