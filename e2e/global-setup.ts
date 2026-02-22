import { execSync } from "child_process";

async function globalSetup() {
  console.log("Starting global setup...");

  // CI では DATABASE_URL がジョブレベルで設定済み（file:./e2e-test.db）
  // ローカル開発では dev.db を汚染しないよう test.db にフォールバック
  const devDbPatterns = [/dev\.db/, /prisma\/dev\.db/];
  const currentUrl = process.env.DATABASE_URL ?? "";
  const isDevDb = !currentUrl || devDbPatterns.some((p) => p.test(currentUrl));

  if (isDevDb) {
    process.env.DATABASE_URL = "file:./test.db";
  }

  const dbUrl = process.env.DATABASE_URL;
  console.log(`Using database: ${dbUrl}`);

  try {
    // スキーマを DB に適用（ローカル開発時の test.db 未初期化ケースに対応）
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });

    console.log("Running tests database seed...");
    execSync("npm run db:seed-test", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    throw error;
  }
}

export default globalSetup;
