import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
const post = vi.fn().mockResolvedValue(undefined);
const clear = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("next/link", () => ({
  // Render children as a plain <a> so we can query the href.
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ clear }),
}));

vi.mock("@/lib/api/identity", () => ({
  logout: (...args: unknown[]) => post("/api/identity/logout", ...args),
}));

import { NavAuth } from "@/components/layout/nav-auth";

describe("NavAuth", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    post.mockClear();
    clear.mockClear();
  });

  it("renders a login link when no displayName is provided", () => {
    render(<NavAuth displayName={null} />);
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });

  it("renders the display name and a logout button when signed in", () => {
    render(<NavAuth displayName="Alice" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls the logout endpoint, clears the query cache, then redirects to /login", async () => {
    const user = userEvent.setup();
    render(<NavAuth displayName="Alice" />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(post).toHaveBeenCalledWith("/api/identity/logout");
    expect(clear).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
  });

  it("still redirects to /login when the logout request fails", async () => {
    post.mockRejectedValueOnce(new Error("network"));
    const user = userEvent.setup();
    render(<NavAuth displayName="Alice" />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(clear).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/login");
  });
});
