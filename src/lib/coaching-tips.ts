export type CoachingCategory =
  | "傾聴"
  | "質問"
  | "承認・ねぎらい"
  | "ベストプラクティス"
  | "フィードバック";

export interface CoachingTip {
  readonly id: string;
  readonly category: CoachingCategory;
  readonly text: string;
  readonly detail?: string;
}

export const COACHING_TIPS: readonly CoachingTip[] = [
  // 傾聴（8件）
  {
    id: "listening-1",
    category: "傾聴",
    text: "相手が話し終わるまで、口を挟まずに聴きましょう。",
    detail: "相手のペースを尊重し、沈黙も大切なコミュニケーションの一部です。",
  },
  {
    id: "listening-2",
    category: "傾聴",
    text: "「なるほど」「そうなんですね」と相槌を打ちながら聴きましょう。",
    detail: "言語的な反応が相手に「聴いてもらえている」という安心感を与えます。",
  },
  {
    id: "listening-3",
    category: "傾聴",
    text: "相手の言葉を繰り返す「オウム返し」で理解を確認しましょう。",
    detail: "「〇〇ということですね」と言い換えることで誤解を防げます。",
  },
  {
    id: "listening-4",
    category: "傾聴",
    text: "メモを取りながら聴くと、相手への関心が伝わります。",
    detail: "何をメモしているかを見せることで真剣さを示せます。",
  },
  {
    id: "listening-5",
    category: "傾聴",
    text: "相手の感情や背景にも注意を向けて聴きましょう。",
    detail: "言葉の裏にある感情を読み取ることが深い傾聴につながります。",
  },
  {
    id: "listening-6",
    category: "傾聴",
    text: "スマートフォンや PCから視線を外して、相手に集中しましょう。",
    detail: "アイコンタクトは「あなたが大切だ」というメッセージを伝えます。",
  },
  {
    id: "listening-7",
    category: "傾聴",
    text: "相手の話を評価・判断せずに、まず受け止めることを意識しましょう。",
    detail: "ジャッジを保留することで相手が本音を話しやすくなります。",
  },
  {
    id: "listening-8",
    category: "傾聴",
    text: "話の内容だけでなく、声のトーンや表情にも注目しましょう。",
    detail: "非言語コミュニケーションからより多くの情報が得られます。",
  },

  // 質問（8件）
  {
    id: "question-1",
    category: "質問",
    text: "「どう思いますか？」「どう感じましたか？」でオープンに聴きましょう。",
    detail: "Yes/No で答えられない質問が相手の思考を引き出します。",
  },
  {
    id: "question-2",
    category: "質問",
    text: "「もう少し詳しく教えてもらえますか？」と深掘りしましょう。",
    detail: "一歩踏み込んだ質問が本質的な課題の発見につながります。",
  },
  {
    id: "question-3",
    category: "質問",
    text: "「理想の状態はどんなイメージですか？」で目標を明確にしましょう。",
    detail: "未来志向の質問が行動へのモチベーションを高めます。",
  },
  {
    id: "question-4",
    category: "質問",
    text: "「何があれば前に進めそうですか？」と障壁と資源を整理しましょう。",
    detail: "解決策を本人が考えることで主体性が育まれます。",
  },
  {
    id: "question-5",
    category: "質問",
    text: "「それによってどんな影響がありましたか？」で影響を一緒に考えましょう。",
    detail: "影響の可視化が優先順位づけをサポートします。",
  },
  {
    id: "question-6",
    category: "質問",
    text: "「今一番気になっていることは何ですか？」で本人のアジェンダを引き出しましょう。",
    detail: "マネージャーのアジェンダより本人の関心事から始めることが効果的です。",
  },
  {
    id: "question-7",
    category: "質問",
    text: "「うまくいったとしたら、何が違ったと思いますか？」で学びを引き出しましょう。",
    detail: "仮定の質問が柔軟な思考を促します。",
  },
  {
    id: "question-8",
    category: "質問",
    text: "「自分自身ではどう評価していますか？」で自己認識を促しましょう。",
    detail: "自己評価を先に聞くことでフィードバックの受け取りやすさが増します。",
  },

  // 承認・ねぎらい（8件）
  {
    id: "recognition-1",
    category: "承認・ねぎらい",
    text: "「〇〇の取り組みを見ていて、とても頼もしく思っています。」",
    detail: "具体的な行動を挙げることで承認の信頼性が増します。",
  },
  {
    id: "recognition-2",
    category: "承認・ねぎらい",
    text: "「先週の発表、わかりやすくて好評でしたよ。」と第三者の声を伝えましょう。",
    detail: "マネージャー以外の評価を伝えることで客観性が増します。",
  },
  {
    id: "recognition-3",
    category: "承認・ねぎらい",
    text: "「忙しい中でも丁寧に対応してくれて、ありがとう。」",
    detail: "プロセスへのねぎらいが継続的な努力を支えます。",
  },
  {
    id: "recognition-4",
    category: "承認・ねぎらい",
    text: "「あなたのチームへの貢献は、チーム全体の雰囲気を良くしています。」",
    detail: "チームへの影響を言語化することでやりがいを高めます。",
  },
  {
    id: "recognition-5",
    category: "承認・ねぎらい",
    text: "「あの状況でよく諦めずに取り組みましたね。」と粘り強さを認めましょう。",
    detail: "プロセスや姿勢を承認することが成長マインドセットを育てます。",
  },
  {
    id: "recognition-6",
    category: "承認・ねぎらい",
    text: "「最近グッと成長したなと感じています。」と成長を言葉にしましょう。",
    detail: "変化・成長を具体的に言語化することが自己効力感を高めます。",
  },
  {
    id: "recognition-7",
    category: "承認・ねぎらい",
    text: "「あなたがいてくれるからチームが助かっています。」",
    detail: "存在そのものへの感謝がエンゲージメントを高めます。",
  },
  {
    id: "recognition-8",
    category: "承認・ねぎらい",
    text: "「その判断は正しかったと思います。よく気づきましたね。」",
    detail: "判断力や気づきを認めることで自信をサポートします。",
  },

  // ベストプラクティス（8件）
  {
    id: "best-practice-1",
    category: "ベストプラクティス",
    text: "メンバーに7割話してもらいましょう。1on1はメンバーのための時間です。",
    detail: "マネージャーが話しすぎると、メンバーの本音が引き出せません。",
  },
  {
    id: "best-practice-2",
    category: "ベストプラクティス",
    text: "週1回30分の定期開催が効果的です。頻度と一貫性が信頼を築きます。",
    detail: "不定期より定期の方が心理的安全性が高まります。",
  },
  {
    id: "best-practice-3",
    category: "ベストプラクティス",
    text: "アジェンダはメンバーに準備してもらいましょう。主体性が生まれます。",
    detail: "「今日は何を話したいですか？」から始めるのが効果的です。",
  },
  {
    id: "best-practice-4",
    category: "ベストプラクティス",
    text: "アクションアイテムを必ず記録し、次回の冒頭で振り返りましょう。",
    detail: "フォローアップがないと、1on1への信頼感が薄れます。",
  },
  {
    id: "best-practice-5",
    category: "ベストプラクティス",
    text: "プライベートな場所で行い、心理的安全性を確保しましょう。",
    detail: "オープンスペースより個室や静かな場所が本音を引き出しやすいです。",
  },
  {
    id: "best-practice-6",
    category: "ベストプラクティス",
    text: "業務の進捗確認ではなく、メンバーの成長・課題に焦点を当てましょう。",
    detail: "進捗確認は別の機会（デイリー等）に行い、1on1は人に集中します。",
  },
  {
    id: "best-practice-7",
    category: "ベストプラクティス",
    text: "1on1で話した内容は機密として扱い、信頼関係を守りましょう。",
    detail: "メンバーが安心して本音を話せる環境づくりが最重要です。",
  },
  {
    id: "best-practice-8",
    category: "ベストプラクティス",
    text: "メンバーのキャリアビジョンを定期的に確認し、成長を支援しましょう。",
    detail: "短期・中長期のキャリア目標を対話で深めることが大切です。",
  },

  // フィードバック（6件）
  {
    id: "feedback-1",
    category: "フィードバック",
    text: "SBIフレームワーク: 状況(Situation)→行動(Behavior)→影響(Impact)の順で伝えましょう。",
    detail:
      "「先週の〇〇の場面で（S）、△△という行動をしたとき（B）、チームに□□という影響がありました（I）」",
  },
  {
    id: "feedback-2",
    category: "フィードバック",
    text: "フィードバックは「評価」ではなく「観察」として伝えましょう。",
    detail: "「あなたはこういう人だ」ではなく「この行動を見て気になりました」と伝えます。",
  },
  {
    id: "feedback-3",
    category: "フィードバック",
    text: "ポジティブなフィードバックを先に伝え、改善点は後から添えましょう。",
    detail: "ポジティブを先に伝えることで改善点も受け取りやすくなります。",
  },
  {
    id: "feedback-4",
    category: "フィードバック",
    text: "フィードバック後は「どう感じましたか？」と相手の受け取り方を確認しましょう。",
    detail: "一方的に伝えるだけでなく、対話として成立させることが重要です。",
  },
  {
    id: "feedback-5",
    category: "フィードバック",
    text: "改善を求める場合は、具体的な代替行動を一緒に考えましょう。",
    detail: "「どうすればよかったと思いますか？」と本人に考えてもらうのが効果的です。",
  },
  {
    id: "feedback-6",
    category: "フィードバック",
    text: "フィードバックはできる限り早く、具体的な出来事を元に伝えましょう。",
    detail: "時間が経つと記憶が薄れ、フィードバックの効果が下がります。",
  },
];

export function getRandomTipByCategory(category: CoachingCategory, exclude?: string): CoachingTip {
  const tipsInCategory = COACHING_TIPS.filter((tip) => tip.category === category);
  const candidates =
    exclude !== undefined ? tipsInCategory.filter((tip) => tip.id !== exclude) : tipsInCategory;

  const pool = candidates.length > 0 ? candidates : tipsInCategory;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getRandomTips(count: number): CoachingTip[] {
  if (count <= 0) return [];

  const shuffled = [...COACHING_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getTipsByCategory(category: CoachingCategory): readonly CoachingTip[] {
  return COACHING_TIPS.filter((tip) => tip.category === category);
}
