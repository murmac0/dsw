import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders a div by default and passes through attributes", () => {
    render(<Stack data-testid="s" aria-label="Members">a</Stack>);
    const el = screen.getByTestId("s");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveAttribute("aria-label", "Members");
  });

  it("keeps list semantics when rendered as a list", () => {
    render(
      <Stack as="ul" aria-label="Members">
        <li>Ada</li>
        <li>Grace</li>
      </Stack>,
    );
    expect(screen.getByRole("list", { name: "Members" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
