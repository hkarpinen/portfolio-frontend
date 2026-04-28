import { LoginForm } from "./login-form";

function getSafeRedirectPath(from?: string): string {
  if (!from) return "/communities";
  if (!from.startsWith("/")) return "/communities";
  if (from.startsWith("//")) return "/communities";
  return from;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { from?: string };
}) {
  return <LoginForm from={getSafeRedirectPath(searchParams?.from)} />;
}
