import "dotenv/config";

import { ActionItemStatus, PrismaClient, TopicCategory } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

// ── ユーティリティ関数 ────────────────────────────────

/** 日付からフェーズ番号を返す（1〜4） */
function getPhase(date: Date): 1 | 2 | 3 | 4 {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (year === 2025) {
    if (month >= 3 && month <= 5) return 1;
    if (month >= 6 && month <= 8) return 2;
    if (month >= 9 && month <= 11) return 3;
  }
  return 4;
}

/** 隔週のミーティング日付配列を生成する */
function generateMeetingDates(startDate: Date, endDate: Date, intervalDays: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + intervalDays);
  }
  return dates;
}

/** チェックインスコアを返す（1〜5） */
function getCheckinScore(
  memberId: "tanaka" | "suzuki" | "sato",
  phase: 1 | 2 | 3 | 4,
  axis: "health" | "mood" | "workload",
): number {
  const table: Record<
    "tanaka" | "suzuki" | "sato",
    Record<"health" | "mood" | "workload", Record<1 | 2 | 3 | 4, number>>
  > = {
    tanaka: {
      health: { 1: 3, 2: 2, 3: 4, 4: 4 },
      mood: { 1: 4, 2: 2, 3: 4, 4: 5 },
      workload: { 1: 3, 2: 5, 3: 3, 4: 2 },
    },
    suzuki: {
      health: { 1: 4, 2: 3, 3: 4, 4: 4 },
      mood: { 1: 4, 2: 3, 3: 5, 4: 4 },
      workload: { 1: 3, 2: 5, 3: 4, 4: 3 },
    },
    sato: {
      health: { 1: 2, 2: 3, 3: 4, 4: 4 },
      mood: { 1: 2, 2: 3, 3: 5, 4: 4 },
      workload: { 1: 4, 2: 4, 3: 3, 4: 2 },
    },
  };
  return table[memberId][axis][phase];
}

// ── フェーズ別トピックテンプレート ─────────────────────

type TopicTemplate = {
  category: TopicCategory;
  title: string;
  notes: string;
  tagKeys: string[];
};

const topicsByMemberPhase: Record<
  "tanaka" | "suzuki" | "sato",
  Record<1 | 2 | 3 | 4, TopicTemplate[][]>
> = {
  tanaka: {
    1: [
      [
        {
          category: "WORK_PROGRESS",
          title: "Sprint 進捗確認",
          notes: "予定通り進行中。API 実装完了。",
          tagKeys: ["開発"],
        },
        {
          category: "CAREER",
          title: "テックリード研修の計画",
          notes: "社内研修プログラムに登録。4月から開始予定。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "コードレビュー品質向上",
          notes: "レビューコメントの質が上がってきた。",
          tagKeys: ["開発", "改善"],
        },
        {
          category: "FEEDBACK",
          title: "チームメンバーへのフィードバック",
          notes: "定期的なフィードバックを心がけている。",
          tagKeys: ["チーム"],
        },
      ],
      [
        {
          category: "CAREER",
          title: "テックリードに向けたスキルギャップ",
          notes: "アーキテクチャ設計の経験が不足。勉強中。",
          tagKeys: ["キャリア"],
        },
        {
          category: "WORK_PROGRESS",
          title: "新機能の設計レビュー",
          notes: "設計書のレビューを担当。フィードバック反映中。",
          tagKeys: ["開発"],
        },
      ],
    ],
    2: [
      [
        {
          category: "WORK_PROGRESS",
          title: "テックリード着任後の状況",
          notes: "想定より業務量が多い。優先順位の整理が必要。",
          tagKeys: ["開発", "緊急"],
        },
        {
          category: "ISSUES",
          title: "チームコミュニケーションの課題",
          notes: "メンバー間の情報共有が不十分。改善策を検討中。",
          tagKeys: ["チーム", "改善"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "アーキテクチャ改善プロジェクト",
          notes: "マイクロサービス移行の調査開始。",
          tagKeys: ["開発"],
        },
        {
          category: "ISSUES",
          title: "技術的負債への対応",
          notes: "レガシーコードのリファクタリングが急務。",
          tagKeys: ["開発", "緊急"],
        },
      ],
      [
        {
          category: "CAREER",
          title: "リーダーシップスキルの振り返り",
          notes: "メンバーへの委任が少なすぎた。改善中。",
          tagKeys: ["キャリア"],
        },
        {
          category: "FEEDBACK",
          title: "上位職からのフィードバック",
          notes: "意思決定スピードを上げるよう指摘あり。",
          tagKeys: ["キャリア"],
        },
      ],
    ],
    3: [
      [
        {
          category: "WORK_PROGRESS",
          title: "Q3 リリース準備",
          notes: "全機能の実装完了。QA フェーズへ移行。",
          tagKeys: ["開発"],
        },
        {
          category: "CAREER",
          title: "チームマネジメントの手応え",
          notes: "委任が増え、チームのアウトプットが向上。",
          tagKeys: ["キャリア", "チーム"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "リリース後の振り返り",
          notes: "重大バグゼロでリリース成功。チームを称賛。",
          tagKeys: ["開発", "チーム"],
        },
        {
          category: "FEEDBACK",
          title: "チームメンバーの成長",
          notes: "佐藤のスキルアップが著しい。次のステップを検討。",
          tagKeys: ["チーム"],
        },
      ],
      [
        {
          category: "CAREER",
          title: "エンジニアリングマネージャーへの興味",
          notes: "マネジメントへのキャリアパスを考え始めた。",
          tagKeys: ["キャリア"],
        },
        {
          category: "WORK_PROGRESS",
          title: "次期プロジェクトの設計",
          notes: "新機能の設計をリード。チームと議論中。",
          tagKeys: ["開発"],
        },
      ],
    ],
    4: [
      [
        {
          category: "CAREER",
          title: "メンタリング活動の開始",
          notes: "佐藤へのメンタリングを開始。週1回 1on1 を設定。",
          tagKeys: ["キャリア", "チーム"],
        },
        {
          category: "WORK_PROGRESS",
          title: "年末スプリントの計画",
          notes: "年末に向けた優先度の高いタスクを整理。",
          tagKeys: ["開発"],
        },
      ],
      [
        {
          category: "FEEDBACK",
          title: "2025年の振り返り",
          notes: "テックリードとして大きく成長した1年だった。",
          tagKeys: ["キャリア"],
        },
        {
          category: "CAREER",
          title: "2026年の目標設定",
          notes: "EM への転向を真剣に検討。上司に相談予定。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "Q1 2026 ロードマップ",
          notes: "チームで OKR を策定。全員が納得感を持てた。",
          tagKeys: ["開発", "チーム"],
        },
        {
          category: "OTHER",
          title: "チームビルディング活動",
          notes: "オフサイトの企画を提案。来月実施予定。",
          tagKeys: ["チーム"],
        },
      ],
    ],
  },

  suzuki: {
    1: [
      [
        {
          category: "WORK_PROGRESS",
          title: "新機能ユーザーリサーチの進捗",
          notes: "5名インタビュー完了。主要な課題を特定。",
          tagKeys: ["改善"],
        },
        {
          category: "ISSUES",
          title: "デザインチームとの連携",
          notes: "コミュニケーション頻度が不足。週次同期を提案。",
          tagKeys: ["チーム", "改善"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "プロダクトロードマップ策定",
          notes: "Q2〜Q3 のロードマップドラフト完成。レビュー待ち。",
          tagKeys: ["改善"],
        },
        {
          category: "CAREER",
          title: "プロダクト戦略スキルの向上",
          notes: "戦略フレームワークの勉強を継続中。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "FEEDBACK",
          title: "エンジニアチームへのフィードバック",
          notes: "要件の明確化を早める必要があると感じている。",
          tagKeys: ["チーム"],
        },
        {
          category: "WORK_PROGRESS",
          title: "競合調査レポート",
          notes: "主要競合3社の分析完了。差別化ポイントを整理。",
          tagKeys: ["改善"],
        },
      ],
    ],
    2: [
      [
        {
          category: "ISSUES",
          title: "エンジニアとの要件認識ギャップ",
          notes: "仕様書の記述が曖昧で手戻りが発生。改善急務。",
          tagKeys: ["チーム", "緊急"],
        },
        {
          category: "WORK_PROGRESS",
          title: "MVP 仕様の確定",
          notes: "ステークホルダーとの合意形成に時間がかかっている。",
          tagKeys: ["緊急"],
        },
      ],
      [
        {
          category: "ISSUES",
          title: "スコープクリープへの対処",
          notes: "追加要求が多く、リリース遅延リスクあり。",
          tagKeys: ["緊急"],
        },
        {
          category: "CAREER",
          title: "ステークホルダーマネジメントの難しさ",
          notes: "経営層との期待値調整に苦労している。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "開発チームとの仕様書レビュー",
          notes: "ドキュメント改善により手戻りが減少。",
          tagKeys: ["チーム", "改善"],
        },
        {
          category: "FEEDBACK",
          title: "エンジニアからのフィードバック",
          notes: "仕様の明確さが向上したと好評。",
          tagKeys: ["チーム"],
        },
      ],
    ],
    3: [
      [
        {
          category: "WORK_PROGRESS",
          title: "新機能のベータリリース",
          notes: "ベータユーザー50名に公開。フィードバック収集中。",
          tagKeys: ["改善"],
        },
        {
          category: "FEEDBACK",
          title: "ユーザーからの初期反応",
          notes: "想定以上に好評。NPS スコアが15ポイント向上。",
          tagKeys: ["改善"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "プロダクト正式リリース",
          notes: "全ユーザーへのロールアウト完了。大きな問題なし。",
          tagKeys: ["改善"],
        },
        {
          category: "CAREER",
          title: "プロダクト戦略のオーナーシップ",
          notes: "次期戦略策定のリードを任された。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "CAREER",
          title: "シニア PM へのキャリアパス",
          notes: "来年度にシニア昇格を目指すことで合意。",
          tagKeys: ["キャリア"],
        },
        {
          category: "WORK_PROGRESS",
          title: "次期機能の企画開始",
          notes: "AI 活用機能のコンセプト検討中。",
          tagKeys: ["改善"],
        },
      ],
    ],
    4: [
      [
        {
          category: "WORK_PROGRESS",
          title: "採用活動への参加",
          notes: "PM 候補の面接を3名担当。1名オファー予定。",
          tagKeys: ["チーム"],
        },
        {
          category: "CAREER",
          title: "チームリードの準備",
          notes: "新 PM のオンボーディング計画を策定中。",
          tagKeys: ["キャリア", "チーム"],
        },
      ],
      [
        {
          category: "ISSUES",
          title: "チーム拡大に伴う連携コスト",
          notes: "人数が増えて会議が増えた。効率化が必要。",
          tagKeys: ["チーム", "改善"],
        },
        {
          category: "WORK_PROGRESS",
          title: "2026年プロダクト戦略",
          notes: "中長期戦略のドラフトを作成。経営レビュー待ち。",
          tagKeys: ["改善"],
        },
      ],
      [
        {
          category: "FEEDBACK",
          title: "2025年の振り返りと成長",
          notes: "リリース成功・戦略立案・採用と充実した1年。",
          tagKeys: ["キャリア"],
        },
        {
          category: "CAREER",
          title: "シニア PM への昇格準備",
          notes: "昇格審査の準備開始。実績をまとめ中。",
          tagKeys: ["キャリア"],
        },
      ],
    ],
  },

  sato: {
    1: [
      [
        {
          category: "WORK_PROGRESS",
          title: "バグ修正タスクの進捗",
          notes: "3件中2件完了。複雑なバグに手こずっている。",
          tagKeys: ["開発"],
        },
        {
          category: "FEEDBACK",
          title: "コードレビューのフィードバック",
          notes: "可読性の改善について指摘を受けた。意識して改善中。",
          tagKeys: ["開発", "改善"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "ユニットテストの追加",
          notes: "カバレッジを70%から85%に向上。",
          tagKeys: ["開発", "改善"],
        },
        {
          category: "CAREER",
          title: "スキルアップの方向性",
          notes: "バックエンドを深掘りするか、フルスタックに広げるか検討中。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "ドキュメント整備",
          notes: "API ドキュメントを整備。チームに好評。",
          tagKeys: ["開発"],
        },
        {
          category: "ISSUES",
          title: "タスクの優先順位づけの難しさ",
          notes: "複数タスクを並行してこなすのが苦手。",
          tagKeys: ["改善"],
        },
      ],
    ],
    2: [
      [
        {
          category: "WORK_PROGRESS",
          title: "初の機能開発リード",
          notes: "チームの中で初めてサブ機能のリードを担当。緊張している。",
          tagKeys: ["開発"],
        },
        {
          category: "ISSUES",
          title: "設計判断への不安",
          notes: "自分のアーキテクチャ判断が正しいか自信がない。",
          tagKeys: ["開発", "緊急"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "機能開発の進捗",
          notes: "思ったより順調。田中さんのサポートが助かっている。",
          tagKeys: ["開発"],
        },
        {
          category: "FEEDBACK",
          title: "田中テックリードからのフィードバック",
          notes: "設計の考え方が成長している、と言われた。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "ISSUES",
          title: "技術的負債の対処",
          notes: "レガシーコードへの対応に時間がかかっている。",
          tagKeys: ["開発", "緊急"],
        },
        {
          category: "CAREER",
          title: "シニアエンジニアへの意識",
          notes: "来年度にシニアを目指したいと伝えた。",
          tagKeys: ["キャリア"],
        },
      ],
    ],
    3: [
      [
        {
          category: "WORK_PROGRESS",
          title: "Q3 機能リリースの貢献",
          notes: "担当機能がリリースに貢献。チームに感謝された。",
          tagKeys: ["開発", "チーム"],
        },
        {
          category: "CAREER",
          title: "自信の変化",
          notes: "6ヶ月前より技術的判断に自信が持てるようになった。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "パフォーマンス改善プロジェクト",
          notes: "APIレスポンスタイムを40%削減。上司に褒められた。",
          tagKeys: ["開発", "改善"],
        },
        {
          category: "FEEDBACK",
          title: "チームへのポジティブな影響",
          notes: "自分のプルリクが他のメンバーの参考になっている。",
          tagKeys: ["チーム"],
        },
      ],
      [
        {
          category: "CAREER",
          title: "メンタリングを受ける立場から考える",
          notes: "田中さんのメンタリングがとても参考になっている。",
          tagKeys: ["キャリア"],
        },
        {
          category: "WORK_PROGRESS",
          title: "新機能の設計提案",
          notes: "自分でアーキテクチャ提案書を作成した。好評だった。",
          tagKeys: ["開発"],
        },
      ],
    ],
    4: [
      [
        {
          category: "CAREER",
          title: "シニアエンジニア昇格の準備",
          notes: "昇格に向けた実績整理を始めた。田中さんにアドバイスをもらう予定。",
          tagKeys: ["キャリア"],
        },
        {
          category: "WORK_PROGRESS",
          title: "後輩エンジニアのサポート",
          notes: "新入社員のコードレビューを担当し始めた。",
          tagKeys: ["チーム"],
        },
      ],
      [
        {
          category: "FEEDBACK",
          title: "2025年の振り返り",
          notes: "機能リード・パフォーマンス改善・後輩育成と大きく成長した。",
          tagKeys: ["キャリア"],
        },
        {
          category: "CAREER",
          title: "2026年の目標",
          notes: "シニアエンジニア昇格と、チームへの技術貢献を目標に設定。",
          tagKeys: ["キャリア"],
        },
      ],
      [
        {
          category: "WORK_PROGRESS",
          title: "Q1 2026 の担当機能",
          notes: "新機能の実装リードを正式に任された。",
          tagKeys: ["開発"],
        },
        {
          category: "OTHER",
          title: "チームの雰囲気について",
          notes: "田中さんのリードでチームの心理的安全性が高まっている。",
          tagKeys: ["チーム"],
        },
      ],
    ],
  },
};

// ── アクションアイテムテンプレート ──────────────────────

type ActionTemplate = {
  title: string;
  tagKeys: string[];
};

const actionsByMemberPhase: Record<
  "tanaka" | "suzuki" | "sato",
  Record<1 | 2 | 3 | 4, ActionTemplate[]>
> = {
  tanaka: {
    1: [
      { title: "テックリード向け研修の申し込み", tagKeys: ["キャリア"] },
      { title: "コードレビューガイドラインの作成", tagKeys: ["開発"] },
      {
        title: "アーキテクチャ設計書のテンプレート作成",
        tagKeys: ["開発"],
      },
      {
        title: "チームの技術課題リストを整理する",
        tagKeys: ["開発", "改善"],
      },
    ],
    2: [
      {
        title: "チームの週次 MTG アジェンダを改善する",
        tagKeys: ["チーム", "改善"],
      },
      {
        title: "技術的負債の優先順位リストを作成",
        tagKeys: ["開発", "緊急"],
      },
      {
        title: "マイクロサービス移行の PoC を実施",
        tagKeys: ["開発"],
      },
      {
        title: "1on1 で各メンバーの課題をヒアリング",
        tagKeys: ["チーム"],
      },
    ],
    3: [
      {
        title: "Q3 リリース後の振り返りドキュメントを作成",
        tagKeys: ["開発"],
      },
      {
        title: "佐藤のメンタリング計画を立てる",
        tagKeys: ["チーム", "キャリア"],
      },
      {
        title: "EM へのキャリアパスについて上司と相談",
        tagKeys: ["キャリア"],
      },
      {
        title: "次期プロジェクトの技術選定資料を作成",
        tagKeys: ["開発"],
      },
    ],
    4: [
      {
        title: "2026年エンジニアリングロードマップを作成",
        tagKeys: ["開発"],
      },
      { title: "オフサイトの企画書を提出", tagKeys: ["チーム"] },
      { title: "EM 転向について HR と面談", tagKeys: ["キャリア"] },
      {
        title: "新メンバーオンボーディング資料を更新",
        tagKeys: ["チーム"],
      },
    ],
  },
  suzuki: {
    1: [
      {
        title: "ユーザーリサーチレポートをまとめる",
        tagKeys: ["改善"],
      },
      {
        title: "デザインチームと週次ミーティングを設定",
        tagKeys: ["チーム"],
      },
      { title: "競合調査レポートを作成する", tagKeys: ["改善"] },
      {
        title: "プロダクトロードマップのドラフトを作成",
        tagKeys: ["改善"],
      },
    ],
    2: [
      {
        title: "仕様書テンプレートを改善する",
        tagKeys: ["チーム", "改善"],
      },
      {
        title: "ステークホルダーへの進捗報告資料を作成",
        tagKeys: ["緊急"],
      },
      { title: "スコープ調整の合意書を作成", tagKeys: ["緊急"] },
      {
        title: "エンジニアとの要件定義プロセスを見直す",
        tagKeys: ["チーム", "改善"],
      },
    ],
    3: [
      {
        title: "ベータフィードバックをまとめてプロダクトに反映",
        tagKeys: ["改善"],
      },
      {
        title: "正式リリースのプレスリリースを作成",
        tagKeys: ["改善"],
      },
      {
        title: "シニア PM 昇格に向けた実績整理",
        tagKeys: ["キャリア"],
      },
      { title: "次期機能の UX 調査を開始", tagKeys: ["改善"] },
    ],
    4: [
      {
        title: "採用候補者へのフィードバックを提出",
        tagKeys: ["チーム"],
      },
      {
        title: "新 PM のオンボーディング計画を作成",
        tagKeys: ["チーム"],
      },
      {
        title: "2026年プロダクト戦略書を完成させる",
        tagKeys: ["改善"],
      },
      { title: "昇格審査書類を提出", tagKeys: ["キャリア"] },
    ],
  },
  sato: {
    1: [
      {
        title: "残りのバグ修正を完了させる",
        tagKeys: ["開発", "緊急"],
      },
      {
        title: "ユニットテストのカバレッジを80%以上にする",
        tagKeys: ["開発"],
      },
      { title: "API ドキュメントを整備する", tagKeys: ["開発"] },
      {
        title: "タスク管理ツールの使い方を改善する",
        tagKeys: ["改善"],
      },
    ],
    2: [
      {
        title: "機能設計書を田中さんにレビューしてもらう",
        tagKeys: ["開発"],
      },
      {
        title: "レガシーコードのリファクタリングを進める",
        tagKeys: ["開発", "緊急"],
      },
      {
        title: "技術ブログを1本書く（勉強のアウトプット）",
        tagKeys: ["キャリア"],
      },
      {
        title: "ペアプログラミングのセッションを設定する",
        tagKeys: ["開発", "チーム"],
      },
    ],
    3: [
      {
        title: "パフォーマンス改善の結果をチームに共有",
        tagKeys: ["開発", "チーム"],
      },
      {
        title: "アーキテクチャ提案書をドキュメント化",
        tagKeys: ["開発"],
      },
      {
        title: "シニア昇格に向けた自己評価シートを記入",
        tagKeys: ["キャリア"],
      },
      {
        title: "新入社員向けコードレビューコメントガイドを作成",
        tagKeys: ["チーム"],
      },
    ],
    4: [
      {
        title: "Q1 2026 担当機能の設計書を作成",
        tagKeys: ["開発"],
      },
      {
        title: "昇格審査に向けた実績資料をまとめる",
        tagKeys: ["キャリア"],
      },
      {
        title: "後輩エンジニアの 1on1 を設定する",
        tagKeys: ["チーム"],
      },
      {
        title: "技術負債対応計画をチームに提案",
        tagKeys: ["開発", "改善"],
      },
    ],
  },
};

// ── メイン処理 ────────────────────────────────────────

async function main() {
  await prisma.actionItemTag.deleteMany();
  await prisma.topicTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "開発", color: "#6366f1" } }),
    prisma.tag.create({ data: { name: "キャリア", color: "#8b5cf6" } }),
    prisma.tag.create({ data: { name: "緊急", color: "#ef4444" } }),
    prisma.tag.create({ data: { name: "チーム", color: "#10b981" } }),
    prisma.tag.create({ data: { name: "改善", color: "#f59e0b" } }),
  ]);
  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  const memberKeys = ["tanaka", "suzuki", "sato"] as const;
  const memberDefs: Record<
    "tanaka" | "suzuki" | "sato",
    { name: string; department: string; position: string }
  > = {
    tanaka: {
      name: "田中太郎",
      department: "エンジニアリング",
      position: "シニアエンジニア",
    },
    suzuki: {
      name: "鈴木花子",
      department: "プロダクト",
      position: "プロダクトマネージャー",
    },
    sato: {
      name: "佐藤次郎",
      department: "エンジニアリング",
      position: "エンジニア",
    },
  };

  const members: Record<string, { id: string }> = {};
  for (const key of memberKeys) {
    members[key] = await prisma.member.create({
      data: { ...memberDefs[key], meetingIntervalDays: 14 },
    });
  }

  const startDate = new Date("2025-03-01");
  const endDate = new Date("2026-02-25");

  for (const memberKey of memberKeys) {
    const memberId = members[memberKey].id;
    const meetingDates = generateMeetingDates(startDate, endDate, 14);
    let pendingActionIds: string[] = [];
    let templateIndex = 0;

    for (let i = 0; i < meetingDates.length; i++) {
      const date = meetingDates[i];
      const phase = getPhase(date);
      const templates = topicsByMemberPhase[memberKey][phase];
      const topicTemplate = templates[templateIndex % templates.length];
      templateIndex++;

      const health = getCheckinScore(memberKey, phase, "health");
      const mood = getCheckinScore(memberKey, phase, "mood");
      const workload = getCheckinScore(memberKey, phase, "workload");

      const actionTemplates = actionsByMemberPhase[memberKey][phase];
      const actionCount = i % 3 === 0 ? 3 : 2;
      const startIdx = (i * 2) % actionTemplates.length;
      const selectedActions: ActionTemplate[] = [];
      for (let j = 0; j < actionCount; j++) {
        selectedActions.push(actionTemplates[(startIdx + j) % actionTemplates.length]);
      }

      const isRecent = i >= meetingDates.length - 3;
      const getNewActionStatus = (idx: number): ActionItemStatus =>
        isRecent ? (idx % 2 === 0 ? "TODO" : "IN_PROGRESS") : "TODO";

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + 14);

      const checkinNotes = ["最近少し疲れ気味です。", "調子は良いです。", "", ""];
      const checkinNote = checkinNotes[i % checkinNotes.length];

      const meeting = await prisma.meeting.create({
        data: {
          memberId,
          date,
          conditionHealth: health,
          conditionMood: mood,
          conditionWorkload: workload,
          checkinNote,
          topics: {
            create: topicTemplate.map((t, idx) => ({
              category: t.category,
              title: t.title,
              notes: t.notes,
              sortOrder: idx,
            })),
          },
          actionItems: {
            create: selectedActions.map((a, idx) => ({
              memberId,
              title: a.title,
              status: getNewActionStatus(idx),
              dueDate,
              sortOrder: idx,
            })),
          },
        },
        include: { topics: true, actionItems: true },
      });

      for (let t = 0; t < topicTemplate.length; t++) {
        for (const tagName of topicTemplate[t].tagKeys) {
          const tagId = tagMap[tagName];
          if (tagId && meeting.topics[t]) {
            await prisma.topicTag.create({
              data: { topicId: meeting.topics[t].id, tagId },
            });
          }
        }
      }

      for (let a = 0; a < selectedActions.length; a++) {
        for (const tagName of selectedActions[a].tagKeys) {
          const tagId = tagMap[tagName];
          if (tagId && meeting.actionItems[a]) {
            await prisma.actionItemTag.create({
              data: { actionItemId: meeting.actionItems[a].id, tagId },
            });
          }
        }
      }

      const toComplete = pendingActionIds.filter((_, idx) => idx % 5 !== 0);
      for (const actionId of toComplete) {
        await prisma.actionItem.update({
          where: { id: actionId },
          data: {
            status: "DONE",
            completedAt: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000),
          },
        });
      }
      const toProgress = pendingActionIds.filter((_, idx) => idx % 5 === 0);
      for (const actionId of toProgress) {
        await prisma.actionItem.update({
          where: { id: actionId },
          data: { status: "IN_PROGRESS" },
        });
      }

      pendingActionIds = isRecent ? [] : meeting.actionItems.map((a) => a.id);
    }
  }

  console.log("Seed data created successfully!");
  console.log(
    `期間: ${startDate.toISOString().slice(0, 10)} 〜 ${endDate.toISOString().slice(0, 10)}`,
  );
  console.log(`メンバー数: ${memberKeys.length}`);
  const meetingCount = await prisma.meeting.count();
  const actionCount = await prisma.actionItem.count();
  console.log(`ミーティング数: ${meetingCount}`);
  console.log(`アクションアイテム数: ${actionCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
