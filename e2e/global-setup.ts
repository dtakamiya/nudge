import { execSync } from "child_process";
import path from "path";

async function globalSetup() {
  console.log("Starting global setup...");
  // 開発環境の DB を直接消さないように保護（必要ならDATABASE_URLを実行時に指定）
  // 実際にはpackage.json側で設定されたURLか、ここで上書きします。
  process.env.DATABASE_URL = "file:./test.db";

  try {
    console.log("Running tests database seed (using test.db)...");
    execSync("npm run db:seed-test", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: "file:./test.db" },
    });
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Failed to seed test database:", error);
    throw error;
  }
}

export default globalSetup;
