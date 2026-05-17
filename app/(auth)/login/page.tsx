import { LoginForm } from "./login-form";

function getSafeRedirectPath(from?: string): string {
  if (!from) return "/forum";
  if (!from.startsWith("/")) return "/forum";
  if (from.startsWith("//")) return "/forum";
  return from;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { from?: string };
}) {
  return <LoginForm from={getSafeRedirectPath(searchParams?.from)} />;
}
