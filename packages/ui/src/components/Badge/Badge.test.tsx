import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("is plain text, not an interactive or live element", () => {
    render(<Badge tone="danger">Overdue</Badge>);
    const badge = screen.getByText("Overdue");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).not.toHaveAttribute("role");
  });
});
