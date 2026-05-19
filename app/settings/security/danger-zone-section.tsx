import { Btn } from "@/components/editorial";

export function DangerZoneSection() {
  return (
    <div className="bg-paper-2 p-5" style={{ border: "1.5px solid var(--red)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-red">Danger Zone</p>
      <p className="text-base text-ink-3 mt-4 mb-8">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <Btn variant="danger" type="button">Delete Account</Btn>
    </div>
  );
}
