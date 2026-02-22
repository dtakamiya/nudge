import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.actionItemTag.deleteMany();
  await prisma.topicTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();

  // サンプルタグを作成
  const tagDev = await prisma.tag.create({
    data: { name: "開発", color: "#6366f1" },
  });
  const tagCareer = await prisma.tag.create({
    data: { name: "キャリア", color: "#8b5cf6" },
  });
  const tagUrgent = await prisma.tag.create({
    data: { name: "緊急", color: "#ef4444" },
  });
  const tagTeam = await prisma.tag.create({
    data: { name: "チーム", color: "#10b981" },
  });
  const tagImprovement = await prisma.tag.create({
    data: { name: "改善", color: "#f59e0b" },
  });

  const tanaka = await prisma.member.create({
    data: {
      name: "田中太郎",
      department: "エンジニアリング",
      position: "シニアエンジニア",
    },
  });

  const suzuki = await prisma.member.create({
    data: {
      name: "鈴木花子",
      department: "プロダクト",
      position: "プロダクトマネージャー",
    },
  });

  const sato = await prisma.member.create({
    data: {
      name: "佐藤次郎",
      department: "エンジニアリング",
      position: "エンジニア",
    },
  });

  const tanakaM1 = await prisma.meeting.create({
    data: {
      memberId: tanaka.id,
      date: new Date("2026-02-10"),
      topics: {
        create: [
          {
            category: "WORK_PROGRESS",
            title: "Sprint 14 の進捗",
            notes: "予定通り進行中。APIの実装が完了。",
            sortOrder: 0,
          },
          {
            category: "CAREER",
            title: "テックリードへのキャリアパス",
            notes: "Q2からテックリードのロールに挑戦したい。",
            sortOrder: 1,
          },
        ],
      },
      actionItems: {
        create: [
          {
            memberId: tanaka.id,
            title: "テックリード向け研修を調査",
            status: "IN_PROGRESS",
            dueDate: new Date("2026-02-28"),
          },
          {
            memberId: tanaka.id,
            title: "コードレビューガイドラインを作成",
            status: "TODO",
            dueDate: new Date("2026-03-15"),
          },
        ],
      },
    },
    include: {
      topics: true,
      actionItems: true,
    },
  });

  // タグをトピックとアクションアイテムに紐付け
  await prisma.topicTag.create({
    data: { topicId: tanakaM1.topics[0].id, tagId: tagDev.id },
  });
  await prisma.topicTag.create({
    data: { topicId: tanakaM1.topics[1].id, tagId: tagCareer.id },
  });
  await prisma.actionItemTag.create({
    data: { actionItemId: tanakaM1.actionItems[0].id, tagId: tagCareer.id },
  });
  await prisma.actionItemTag.create({
    data: { actionItemId: tanakaM1.actionItems[1].id, tagId: tagDev.id },
  });

  const suzukiM1 = await prisma.meeting.create({
    data: {
      memberId: suzuki.id,
      date: new Date("2026-02-12"),
      topics: {
        create: [
          {
            category: "WORK_PROGRESS",
            title: "新機能のユーザーリサーチ",
            notes: "5名のインタビュー完了。主要なペインポイントを特定。",
            sortOrder: 0,
          },
          {
            category: "ISSUES",
            title: "デザインチームとの連携",
            notes: "コミュニケーション頻度を上げる必要がある。",
            sortOrder: 1,
          },
        ],
      },
      actionItems: {
        create: [
          {
            memberId: suzuki.id,
            title: "リサーチレポートをまとめる",
            status: "TODO",
            dueDate: new Date("2026-02-20"),
          },
          {
            memberId: suzuki.id,
            title: "デザインチームと週次ミーティングを設定",
            status: "DONE",
            dueDate: new Date("2026-02-15"),
            completedAt: new Date("2026-02-14"),
          },
        ],
      },
    },
    include: {
      topics: true,
      actionItems: true,
    },
  });

  await prisma.topicTag.create({
    data: { topicId: suzukiM1.topics[1].id, tagId: tagTeam.id },
  });
  await prisma.topicTag.create({
    data: { topicId: suzukiM1.topics[1].id, tagId: tagImprovement.id },
  });
  await prisma.actionItemTag.create({
    data: { actionItemId: suzukiM1.actionItems[0].id, tagId: tagUrgent.id },
  });

  const satoM1 = await prisma.meeting.create({
    data: {
      memberId: sato.id,
      date: new Date("2026-02-14"),
      topics: {
        create: [
          {
            category: "WORK_PROGRESS",
            title: "バグ修正タスクの進捗",
            notes: "3件中2件完了。残り1件は明日完了予定。",
            sortOrder: 0,
          },
          {
            category: "FEEDBACK",
            title: "ペアプログラミングの効果",
            notes: "生産性が上がっている。週2回は継続したい。",
            sortOrder: 1,
          },
        ],
      },
      actionItems: {
        create: [
          {
            memberId: sato.id,
            title: "残りのバグ修正を完了",
            status: "TODO",
            dueDate: new Date("2026-02-17"),
          },
        ],
      },
    },
    include: {
      topics: true,
      actionItems: true,
    },
  });

  await prisma.topicTag.create({
    data: { topicId: satoM1.topics[0].id, tagId: tagDev.id },
  });
  await prisma.topicTag.create({
    data: { topicId: satoM1.topics[1].id, tagId: tagImprovement.id },
  });
  await prisma.actionItemTag.create({
    data: { actionItemId: satoM1.actionItems[0].id, tagId: tagUrgent.id },
  });
  await prisma.actionItemTag.create({
    data: { actionItemId: satoM1.actionItems[0].id, tagId: tagDev.id },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
