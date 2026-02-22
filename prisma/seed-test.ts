import "dotenv/config";

import { fakerJA as faker } from "@faker-js/faker";

import { ActionItemStatus, PrismaClient, TopicCategory } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Reset all existing data
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();

  // 1. E2Eテスト用・手動確認用の固定ユーザー（予測可能なアサーション用）
  const e2eUser = await prisma.member.create({
    data: {
      name: "E2E Test User",
      department: "QA Test Dept",
      position: "QA Engineer",
      meetingIntervalDays: 7,
    },
  });

  await prisma.meeting.create({
    data: {
      memberId: e2eUser.id,
      date: new Date("2026-02-15T10:00:00Z"),
      topics: {
        create: [
          {
            category: TopicCategory.WORK_PROGRESS,
            title: "最近のタスク進捗",
            notes: "順調",
            sortOrder: 0,
          },
          {
            category: TopicCategory.ISSUES,
            title: "困っていること",
            notes: "特に無し",
            sortOrder: 1,
          },
        ],
      },
      actionItems: {
        create: [
          {
            memberId: e2eUser.id,
            title: "テストデータの確認",
            status: ActionItemStatus.TODO,
            dueDate: new Date("2026-03-01T00:00:00Z"),
          },
          {
            memberId: e2eUser.id,
            title: "テストドキュメントの更新",
            status: ActionItemStatus.IN_PROGRESS,
          },
          {
            memberId: e2eUser.id,
            title: "前回までのフォローアップ",
            status: ActionItemStatus.DONE,
            completedAt: new Date("2026-02-14T10:00:00Z"),
          },
        ],
      },
    },
  });

  // 2. ページネーション・一覧表示テスト用のバルクデータ
  const departments = [
    "エンジニアリング",
    "デザイン",
    "プロダクト",
    "営業",
    "マーケティング",
    "人事",
    "カスタマーサクセス",
  ];
  const positions = ["メンバー", "シニア", "リード", "マネージャー", "部長", "スペシャリスト"];

  // 自然なテスト用トピック候補
  const topicTitles = {
    [TopicCategory.WORK_PROGRESS]: [
      "今週のタスク進捗",
      "プロジェクトAの遅延について",
      "リリース準備の状況",
      "コードレビューの負荷",
    ],
    [TopicCategory.CAREER]: [
      "中長期のキャリアパスについて",
      "今後のスキルアップ",
      "マネジメントへの挑戦",
      "他部署への興味",
    ],
    [TopicCategory.ISSUES]: [
      "チーム内のコミュニケーション課題",
      "仕様変更が多すぎる件",
      "開発環境の不満",
      "テスト工数の確保",
    ],
    [TopicCategory.FEEDBACK]: [
      "前回のMTGからの振り返り",
      "プレゼンのフィードバック",
      "コード品質向上への取り組み",
      "ペアプロの感想",
    ],
    [TopicCategory.OTHER]: [
      "最近の体調について",
      "有給取得の相談",
      "リモートワークの環境改善",
      "雑談",
    ],
  };

  const actionItemTitles = [
    "次回の1on1までに目標設定を見直す",
    "チームMTGで課題を共有する",
    "設計ドキュメントを更新する",
    "新しい技術のキャッチアップを行う",
    "検証環境の構築を完了させる",
    "有給申請を提出する",
    "他部署との定例を設定する",
  ];

  const bulkMembers = [];
  for (let i = 0; i < 25; i++) {
    bulkMembers.push({
      name: faker.person.fullName(),
      department: faker.helpers.arrayElement(departments),
      position: faker.helpers.arrayElement(positions),
      meetingIntervalDays: faker.helpers.arrayElement([7, 14, 21, 28]),
    });
  }

  for (let i = 0; i < bulkMembers.length; i++) {
    const memberData = bulkMembers[i];
    const member = await prisma.member.create({ data: memberData });

    // 各メンバーにランダムに1〜3個のミーティングを作成する
    const meetingCount = faker.number.int({ min: 1, max: 3 });
    for (let m = 0; m < meetingCount; m++) {
      // 過去30日以内の日付を生成
      const meetingDate = faker.date.recent({ days: 30 });

      const topicCount = faker.number.int({ min: 1, max: 4 });
      const topicsData = [];
      for (let t = 0; t < topicCount; t++) {
        const category = faker.helpers.enumValue(TopicCategory);
        topicsData.push({
          category,
          title: faker.helpers.arrayElement(topicTitles[category]),
          notes: faker.number.int({ min: 0, max: 3 }) > 0 ? faker.lorem.paragraph() : "",
          sortOrder: t,
        });
      }

      const actionItemCount = faker.number.int({ min: 0, max: 2 });
      const actionItemsData = [];
      for (let a = 0; a < actionItemCount; a++) {
        const status = faker.helpers.enumValue(ActionItemStatus);
        const hasDueDate = faker.datatype.boolean();
        actionItemsData.push({
          memberId: member.id,
          title: faker.helpers.arrayElement(actionItemTitles),
          status,
          dueDate: hasDueDate ? faker.date.soon({ days: 14 }) : null,
          completedAt: status === ActionItemStatus.DONE ? faker.date.recent({ days: 7 }) : null,
          sortOrder: a,
        });
      }

      await prisma.meeting.create({
        data: {
          memberId: member.id,
          date: meetingDate,
          topics: { create: topicsData },
          actionItems: { create: actionItemsData },
        },
      });
    }
  }

  console.log("Test seed data created successfully with Faker!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
