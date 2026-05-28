/** Landing footer — copyright line + social links. Pure server component. */
export function LandingFooter() {
  return (
    <footer className="ed-public-footer" role="contentinfo">
      <div>© 2026 Hank Karpinen · Next.js · .NET 8 · Postgres · RabbitMQ · Docker</div>
      <nav aria-label="Social links" className="flex gap-5">
        <a href="https://github.com/hkarpinen" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/hank-karpinen/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a href="mailto:hank@stackgazette.dev">Email</a>
      </nav>
    </footer>
  );
}
