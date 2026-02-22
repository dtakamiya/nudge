import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MemberForm } from "@/components/member/member-form";

export default function NewMemberPage() {
  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "メンバー追加" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">メンバー追加</h1>
      <MemberForm />
    </div>
  );
}
