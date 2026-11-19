import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./Heading";

describe("Heading", () => {
  it("renders the requested outline level regardless of size", () => {
    render(
      <Heading level={3} size="display1" id="t">
        Billing
      </Heading>,
    );
    const h = screen.getByRole("heading", { level: 3, name: "Billing" });
    expect(h.tagName).toBe("H3");
    expect(h).toHaveAttribute("id", "t");
  });
});
