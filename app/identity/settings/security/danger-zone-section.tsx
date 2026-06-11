import { Btn } from "@/components/editorial";

export function DangerZoneSection() {
  return (
    <section
      id="danger"
      aria-labelledby="danger-zone-heading"
      className="border-[1.5px] border-red bg-paper-2 p-5"
    >
      <h2
        id="danger-zone-heading"
        className="text-[10px] font-bold uppercase tracking-widest text-red"
      >
        Danger Zone
      </h2>
      <p className="mb-2 mt-4 text-base text-ink-3">
        Permanently delete your account and all associated data.
      </p>
      <p className="mb-8 text-sm text-ink-3">
        This action is irreversible. All households, expenses, forum posts, and personal data will
        be erased immediately.
      </p>
      <Btn variant="danger" type="button">
        Delete Account
      </Btn>
    </section>
  );
}
