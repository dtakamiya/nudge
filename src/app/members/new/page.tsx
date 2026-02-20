import { MemberForm } from "@/components/member/member-form";

export default function NewMemberPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">メンバー追加</h1>
      <MemberForm />
    </div>
  );
}
