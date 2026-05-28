import { GithubMark } from "@/components/editorial";

export function RepoFooter({ repo, label }: { repo: string; label: string }) {
  return (
    <footer
      className="mt-16 flex justify-end pt-3"
      style={{ borderTop: "1px solid var(--paper-3)" }}
    >
      <a
        href={`https://github.com/hkarpinen/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-xs no-underline"
        style={{ color: "var(--ink-4)" }}
      >
        <GithubMark size={12} />
        {label}
      </a>
    </footer>
  );
}
