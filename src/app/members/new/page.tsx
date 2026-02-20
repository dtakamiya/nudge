import { MemberForm } from "@/components/member/member-form";

export default function NewMemberPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-heading text-3xl mb-6 text-foreground">メンバー追加</h1>
      <MemberForm />
    </div>
  );
}
