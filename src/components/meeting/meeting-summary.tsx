export interface MeetingSummaryProps {
  date: string;
  conditionHealth: number | null;
  conditionMood: number | null;
  conditionWorkload: number | null;
  checkinNote: string;
  topicCount: number;
  actionItemCount: number;
}

const MAX_CONDITION = 5;

function ConditionBar({ value }: { value: number }) {
  const filled = "●".repeat(value);
  const empty = "○".repeat(MAX_CONDITION - value);
  return (
    <span className="font-mono text-sm">
      {filled}
      {empty}（{value}/{MAX_CONDITION}）
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}年${m}月${d}日`;
}

export function MeetingSummary({
  date,
  conditionHealth,
  conditionMood,
  conditionWorkload,
  checkinNote,
  topicCount,
  actionItemCount,
}: MeetingSummaryProps) {
  const hasAnyCondition =
    conditionHealth !== null || conditionMood !== null || conditionWorkload !== null;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground min-w-[4rem]">日付</span>
        <span className="font-medium">{formatDate(date)}</span>
      </div>

      {hasAnyCondition && (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">コンディション</span>
          <div className="flex flex-col gap-1 pl-2">
            {conditionHealth !== null && (
              <div className="flex items-center gap-2">
                <span>体調🏥:</span>
                <ConditionBar value={conditionHealth} />
              </div>
            )}
            {conditionMood !== null && (
              <div className="flex items-center gap-2">
                <span>気分😊:</span>
                <ConditionBar value={conditionMood} />
              </div>
            )}
            {conditionWorkload !== null && (
              <div className="flex items-center gap-2">
                <span>業務量📋:</span>
                <ConditionBar value={conditionWorkload} />
              </div>
            )}
          </div>
        </div>
      )}

      {checkinNote && (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">チェックインメモ</span>
          <p className="pl-2 text-sm">{checkinNote}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground min-w-[4rem]">話題</span>
        <span className="font-medium">{topicCount}件</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground min-w-[4rem]">アクション</span>
        <span className="font-medium">{actionItemCount}件</span>
      </div>

      {actionItemCount === 0 && (
        <div className="flex items-center gap-1 rounded-md bg-amber-50 px-3 py-2 text-amber-700">
          <span>⚠️</span>
          <span>アクションアイテムが設定されていません</span>
        </div>
      )}
    </div>
  );
}
