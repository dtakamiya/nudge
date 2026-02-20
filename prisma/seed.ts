import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();

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

  await prisma.meeting.create({
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
  });

  await prisma.meeting.create({
    data: {
      memberId: suzuki.id,
      date: new Date("2026-02-12"),
      topics: {
        create: [
          {
            category: "WORK_PROGRESS",
            title: "新機能のユーザーリサーチ",
            notes:
              "5名のインタビュー完了。主要なペインポイントを特定。",
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
  });

  await prisma.meeting.create({
    data: {
      memberId: sato.id,
      date: new Date("2026-02-14"),
      topics: {
        create: [
          {
            category: "WORK_PROGRESS",
            title: "バグ修正タスクの進捗",
            notes:
              "3件中2件完了。残り1件は明日完了予定。",
            sortOrder: 0,
          },
          {
            category: "FEEDBACK",
            title: "ペアプログラミングの効果",
            notes:
              "生産性が上がっている。週2回は継続したい。",
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
