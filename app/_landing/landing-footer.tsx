/** Landing footer — copyright line + social links. Pure server component. */
export function LandingFooter() {
  return (
    <footer className="public-footer" role="contentinfo">
      <span>// © 2026 Hank Karpinen · Next.js 15 · .NET 8 · Postgres · RabbitMQ</span>
      <nav aria-label="Social links" className="links">
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
        <a href="mailto:contact@hankkarpinen.com">Email</a>
      </nav>
    </footer>
  );
}
