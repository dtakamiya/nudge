import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "並び替え可能な項目です。スペースキーまたはエンターキーで掴み、矢印キーで移動し、再度スペースキーで配置します。エスケープキーでキャンセルできます。",
};

export function createAnnouncements(itemLabel: string): Announcements {
  return {
    onDragStart({ active }) {
      return `${itemLabel} ${active.id} を掴みました。`;
    },
    onDragOver({ active, over }) {
      if (over) {
        return `${itemLabel} ${active.id} を ${over.id} の位置に移動中です。`;
      }
      return `${itemLabel} ${active.id} はドロップ先の外にあります。`;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `${itemLabel} ${active.id} を ${over.id} の位置に配置しました。`;
      }
      return `${itemLabel} ${active.id} をドロップしましたが、有効なドロップ先がありませんでした。`;
    },
    onDragCancel({ active }) {
      return `並び替えをキャンセルしました。${itemLabel} ${active.id} は元の位置に戻りました。`;
    },
  };
}
