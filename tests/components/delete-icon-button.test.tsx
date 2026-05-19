import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { DeleteIconButton } from "@/components/editorial/delete-icon-button";

describe("DeleteIconButton", () => {
  it("renders a button with the provided aria-label", () => {
    render(<DeleteIconButton label="Delete item" />);
    const btn = screen.getByRole("button", { name: "Delete item" });
    expect(btn).toBeInTheDocument();
  });

  it("has type=button to prevent accidental form submission", () => {
    render(<DeleteIconButton label="Remove" />);
    expect(screen.getByRole("button", { name: "Remove" })).toHaveAttribute("type", "button");
  });

  it("calls the onClick handler when clicked", async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(<DeleteIconButton label="Delete" onClick={handler} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("respects the disabled prop", async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(<DeleteIconButton label="Delete" onClick={handler} disabled />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("renders the trash SVG icon", () => {
    const { container } = render(<DeleteIconButton label="Delete" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("merges additional className via cn", () => {
    render(<DeleteIconButton label="Delete" className="extra-class" />);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("extra-class");
  });
});
