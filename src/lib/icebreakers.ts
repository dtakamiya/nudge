export type IcebreakerCategory =
  | "最近のこと"
  | "趣味・好き"
  | "仕事の発見"
  | "ウェルネス"
  | "将来・夢";

export interface Icebreaker {
  id: string;
  category: IcebreakerCategory;
  question: string;
}

export const ICEBREAKERS: Icebreaker[] = [
  // 最近のこと（8件）
  {
    id: "recent-1",
    category: "最近のこと",
    question: "最近ハマっていることはありますか？",
  },
  {
    id: "recent-2",
    category: "最近のこと",
    question: "先週で一番よかったことは何ですか？",
  },
  {
    id: "recent-3",
    category: "最近のこと",
    question: "最近読んだ本や観た映画で印象に残ったものはありますか？",
  },
  {
    id: "recent-4",
    category: "最近のこと",
    question: "最近行ってよかった場所はありますか？",
  },
  {
    id: "recent-5",
    category: "最近のこと",
    question: "最近試してみた新しいことはありますか？",
  },
  {
    id: "recent-6",
    category: "最近のこと",
    question: "今週嬉しかった出来事を教えてください。",
  },
  {
    id: "recent-7",
    category: "最近のこと",
    question: "最近美味しかったものは何ですか？",
  },
  {
    id: "recent-8",
    category: "最近のこと",
    question: "最近気になったニュースや話題はありますか？",
  },

  // 趣味・好き（6件）
  {
    id: "hobby-1",
    category: "趣味・好き",
    question: "最近の趣味や好きなことを教えてください。",
  },
  {
    id: "hobby-2",
    category: "趣味・好き",
    question: "休日はどんなことをして過ごしていますか？",
  },
  {
    id: "hobby-3",
    category: "趣味・好き",
    question: "好きな音楽やアーティストはいますか？",
  },
  {
    id: "hobby-4",
    category: "趣味・好き",
    question: "最近ハマっているゲームやスポーツはありますか？",
  },
  {
    id: "hobby-5",
    category: "趣味・好き",
    question: "リフレッシュするために何をしていますか？",
  },
  {
    id: "hobby-6",
    category: "趣味・好き",
    question: "子どもの頃からずっと好きなものはありますか？",
  },

  // 仕事の発見（7件）
  {
    id: "work-1",
    category: "仕事の発見",
    question: "最近で一番学びになった経験は何ですか？",
  },
  {
    id: "work-2",
    category: "仕事の発見",
    question: "仕事で難しいと感じていることはありますか？",
  },
  {
    id: "work-3",
    category: "仕事の発見",
    question: "最近やってみてよかったことはありますか？",
  },
  {
    id: "work-4",
    category: "仕事の発見",
    question: "今取り組んでいる仕事で面白いと思う部分はどこですか？",
  },
  {
    id: "work-5",
    category: "仕事の発見",
    question: "チームの動き方で気づいたことはありますか？",
  },
  {
    id: "work-6",
    category: "仕事の発見",
    question: "うまくいった方法で、今後も使いたいものはありますか？",
  },
  {
    id: "work-7",
    category: "仕事の発見",
    question: "最近誰かに助けてもらったことはありますか？",
  },

  // ウェルネス（6件）
  {
    id: "wellness-1",
    category: "ウェルネス",
    question: "最近の睡眠は良好ですか？",
  },
  {
    id: "wellness-2",
    category: "ウェルネス",
    question: "エネルギー充電はできていますか？",
  },
  {
    id: "wellness-3",
    category: "ウェルネス",
    question: "最近、身体を動かす機会はありましたか？",
  },
  {
    id: "wellness-4",
    category: "ウェルネス",
    question: "今のコンディションを一言で表すとどんな感じですか？",
  },
  {
    id: "wellness-5",
    category: "ウェルネス",
    question: "ストレス解消に効果的だと思うことはありますか？",
  },
  {
    id: "wellness-6",
    category: "ウェルネス",
    question: "最近、自分時間は取れていますか？",
  },

  // 将来・夢（6件）
  {
    id: "future-1",
    category: "将来・夢",
    question: "今チャレンジしてみたいことはありますか？",
  },
  {
    id: "future-2",
    category: "将来・夢",
    question: "6ヶ月後にどうなっていたいですか？",
  },
  {
    id: "future-3",
    category: "将来・夢",
    question: "最近、学んでみたいと思ったスキルはありますか？",
  },
  {
    id: "future-4",
    category: "将来・夢",
    question: "仕事でやってみたいことや試してみたいことはありますか？",
  },
  {
    id: "future-5",
    category: "将来・夢",
    question: "1年後の自分にどんな言葉をかけたいですか？",
  },
  {
    id: "future-6",
    category: "将来・夢",
    question: "今後挑戦したいプロジェクトや役割はありますか？",
  },
];

export function getRandomIcebreaker(exclude?: string): Icebreaker {
  const candidates =
    exclude !== undefined ? ICEBREAKERS.filter((item) => item.id !== exclude) : ICEBREAKERS;

  const pool = candidates.length > 0 ? candidates : ICEBREAKERS;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getRandomIcebreakers(count: number): Icebreaker[] {
  if (count <= 0) return [];

  const shuffled = [...ICEBREAKERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
