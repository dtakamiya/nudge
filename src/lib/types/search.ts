/**
 * メンバー検索結果
 */
export type MemberSearchResult = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
};

/**
 * トピック検索結果
 */
export type TopicSearchResult = {
  id: string;
  title: string;
  notes: string | null;
  category: string;
  meetingId: string;
  memberId: string;
  memberName: string;
};

/**
 * アクションアイテム検索結果
 */
export type ActionItemSearchResult = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  memberId: string;
  memberName: string;
  meetingId: string | null;
};

/**
 * タグ検索結果
 */
export type TagSearchResult = {
  id: string;
  name: string;
  color: string;
};

/**
 * 統合検索結果
 */
export type SearchResults = {
  members: MemberSearchResult[];
  topics: TopicSearchResult[];
  actionItems: ActionItemSearchResult[];
  tags: TagSearchResult[];
};
