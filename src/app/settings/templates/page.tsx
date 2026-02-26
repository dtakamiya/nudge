import { Breadcrumb } from "@/components/layout/breadcrumb";
import { TemplateManagement } from "@/components/meeting/template";
import { getCustomTemplates } from "@/lib/actions/template-actions";

export default async function TemplatesSettingsPage() {
  const templates = await getCustomTemplates();

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "テンプレート管理" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">
        テンプレート管理
      </h1>
      <TemplateManagement templates={templates} />
    </div>
  );
}
