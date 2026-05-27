import { Btn } from "@/components/editorial";

export function DangerZoneSection() {
  return (
    <section id="danger" aria-labelledby="danger-zone-heading" className="bg-paper-2 p-5 border-[1.5px] border-red">
      <h2
        id="danger-zone-heading"
        className="text-[10px] font-bold uppercase tracking-widest text-red"
      >
        Danger Zone
      </h2>
      <p className="text-base text-ink-3 mt-4 mb-2">
        Permanently delete your account and all associated data.
      </p>
      <p className="text-sm text-ink-3 mb-8">
        This action is irreversible. All households, expenses, forum posts, and personal data will be erased immediately.
      </p>
      <Btn variant="danger" type="button">Delete Account</Btn>
    </section>
  );
}
