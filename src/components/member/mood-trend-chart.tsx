import { formatDate } from "@/lib/format";
import { getMoodOption } from "@/lib/mood";

type MoodEntry = {
  date: Date;
  mood: number;
};

type Props = {
  data: MoodEntry[];
};

const CHART_WIDTH = 480;
const CHART_HEIGHT = 120;
const PADDING = { top: 16, right: 24, bottom: 32, left: 32 };

function toX(index: number, total: number): number {
  if (total === 1) return PADDING.left + (CHART_WIDTH - PADDING.left - PADDING.right) / 2;
  return PADDING.left + (index / (total - 1)) * (CHART_WIDTH - PADDING.left - PADDING.right);
}

function toY(mood: number): number {
  // mood 1-5 → Y座標（上が高スコア）
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  return PADDING.top + ((5 - mood) / 4) * innerHeight;
}

export function MoodTrendChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">まだ記録されていません</p>;
  }

  const points = data.map((entry, i) => ({
    x: toX(i, data.length),
    y: toY(entry.mood),
    mood: entry.mood,
    date: entry.date,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // グラジエント用のエリアパス
  const areaPath =
    `M ${points[0].x},${toY(1)} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${toY(1)} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full max-w-lg h-auto"
        role="img"
        aria-label="ミーティングの雰囲気推移グラフ"
      >
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.2 270)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="oklch(0.55 0.2 270)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y軸グリッドライン */}
        {[1, 2, 3, 4, 5].map((mood) => (
          <line
            key={mood}
            x1={PADDING.left}
            y1={toY(mood)}
            x2={CHART_WIDTH - PADDING.right}
            y2={toY(mood)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
            strokeDasharray={mood === 3 ? "4 2" : undefined}
          />
        ))}

        {/* エリア塗り */}
        <path d={areaPath} fill="url(#moodGradient)" />

        {/* 折れ線 */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="oklch(0.55 0.2 270)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* データポイントと絵文字 */}
        {points.map((point, i) => {
          const option = getMoodOption(point.mood);
          return (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="3" fill="oklch(0.55 0.2 270)" />
              <title>{`${formatDate(point.date)}: ${option?.label ?? point.mood}`}</title>
              {data.length <= 8 && (
                <text
                  x={point.x}
                  y={CHART_HEIGHT - PADDING.bottom + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  opacity="0.6"
                >
                  {option?.emoji}
                </text>
              )}
            </g>
          );
        })}

        {/* Y軸ラベル（5段階） */}
        {[1, 3, 5].map((mood) => {
          const option = getMoodOption(mood);
          return (
            <text
              key={mood}
              x={PADDING.left - 4}
              y={toY(mood) + 4}
              textAnchor="end"
              fontSize="9"
              fill="currentColor"
              opacity="0.5"
            >
              {option?.emoji}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
