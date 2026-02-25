import type { TemplateExportFile } from "@/lib/validations/template-schema";
import { templateExportFileSchema } from "@/lib/validations/template-schema";

export type { TemplateExportFile };

export function downloadTemplatesAsJson(data: TemplateExportFile): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nudge-templates-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function readTemplateFile(file: File): Promise<TemplateExportFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") {
          reject(new Error("ファイルの読み込みに失敗しました"));
          return;
        }
        let json: unknown;
        try {
          json = JSON.parse(text);
        } catch {
          reject(new Error("JSONの解析に失敗しました。有効なJSONファイルを選択してください"));
          return;
        }
        const result = templateExportFileSchema.safeParse(json);
        if (!result.success) {
          reject(
            new Error("無効なファイル形式です。Nudgeでエクスポートしたファイルを選択してください"),
          );
          return;
        }
        resolve(result.data);
      } catch {
        reject(new Error("ファイルの読み込みに失敗しました"));
      }
    };
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsText(file, "utf-8");
  });
}
