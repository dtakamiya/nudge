/**
 * 使用頻度付きタグ
 */
export type TagWithCount = {
  id: string;
  name: string;
  color: string;
  _count: { topics: number; actionItems: number };
};
