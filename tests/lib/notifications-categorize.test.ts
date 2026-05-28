import { describe, it, expect } from "vitest";
import { categorizeNotification } from "@/lib/notifications/categorize";

describe("categorizeNotification", () => {
  it("buckets mention-flavoured event types into 'mentions'", () => {
    expect(categorizeNotification("CommentMentionEvent")).toBe("mentions");
    expect(categorizeNotification("user.mentioned")).toBe("mentions");
  });

  it("buckets household tokens into 'household'", () => {
    expect(categorizeNotification("HouseholdInviteEvent")).toBe("household");
    expect(categorizeNotification("ExpenseCreatedEvent")).toBe("household");
    expect(categorizeNotification("ChoreCompletedEvent")).toBe("household");
    expect(categorizeNotification("SettleUpEvent")).toBe("household");
    expect(categorizeNotification("CalendarEventCreated")).toBe("household");
  });

  it("buckets forum tokens into 'forum'", () => {
    expect(categorizeNotification("ThreadReplyEvent")).toBe("forum");
    expect(categorizeNotification("CommentPostedEvent")).toBe("forum");
    expect(categorizeNotification("VoteCastEvent")).toBe("forum");
    expect(categorizeNotification("CommunityCreatedEvent")).toBe("forum");
  });

  it("falls through to 'other' for unrecognised event types", () => {
    expect(categorizeNotification("SystemNoticeEvent")).toBe("other");
    expect(categorizeNotification("")).toBe("other");
  });

  it("matches case-insensitively", () => {
    expect(categorizeNotification("expense")).toBe("household");
    expect(categorizeNotification("EXPENSE")).toBe("household");
  });
});
