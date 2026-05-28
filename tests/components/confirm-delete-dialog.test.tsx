import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDeleteDialog } from "@/components/editorial/confirm-delete-dialog";

/**
 * Pin the three behavioural contracts the audit (§6.4) singled out:
 *   1. The dialog renders nothing when `open` is false.
 *   2. The confirm button fires `onConfirm` exactly once on click.
 *   3. The cancel button (and the `onOpenChange` close path) NEVER calls
 *      `onConfirm` — surprisingly easy to break when wiring a destructive
 *      flow with both actions on the same handler.
 *
 * Plus the `requireText` gate: confirm stays disabled until the user types
 * the expected string verbatim, which protects the household-delete and
 * connection-unlink flows the dialog actually drives.
 */

function setup(props?: Partial<React.ComponentProps<typeof ConfirmDeleteDialog>>) {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();
  const view = render(
    <ConfirmDeleteDialog
      open
      onOpenChange={onOpenChange}
      title="Delete the thing?"
      body="This is permanent."
      isPending={false}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onOpenChange, onConfirm, ...view };
}

describe("<ConfirmDeleteDialog>", () => {
  it("does not render the dialog when `open` is false", () => {
    setup({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("Delete the thing?")).toBeNull();
  });

  it("renders title and body when open", () => {
    setup();
    expect(screen.getByText("Delete the thing?")).toBeInTheDocument();
    expect(screen.getByText("This is permanent.")).toBeInTheDocument();
  });

  it("fires onConfirm exactly once when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const { onConfirm } = setup();
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onConfirm when cancel is clicked — only onOpenChange(false)", async () => {
    const user = userEvent.setup();
    const { onConfirm, onOpenChange } = setup();
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables both buttons while isPending and renames confirm to its progress label", () => {
    setup({ isPending: true });
    const confirm = screen.getByRole("button", { name: /deleting/i });
    expect(confirm).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("uses the custom confirmLabel when provided", () => {
    setup({ confirmLabel: "Disconnect" });
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
  });

  describe("requireText gate", () => {
    it("disables confirm until the user types the expected text", async () => {
      const user = userEvent.setup();
      const { onConfirm } = setup({
        requireText: { expectedText: "delete me", label: 'Type "delete me"' },
      });

      const confirm = screen.getByRole("button", { name: /delete/i });
      expect(confirm).toBeDisabled();

      // Wrong text still leaves it disabled.
      await user.type(screen.getByLabelText('Type "delete me"'), "delete");
      expect(confirm).toBeDisabled();

      // Click attempts on a disabled button must not invoke onConfirm.
      await user.click(confirm);
      expect(onConfirm).not.toHaveBeenCalled();

      // Finishing the expected text unlocks confirm.
      await user.type(screen.getByLabelText('Type "delete me"'), " me");
      expect(confirm).not.toBeDisabled();
      await user.click(confirm);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
