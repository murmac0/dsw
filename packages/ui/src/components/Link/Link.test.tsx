import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link } from "./Link";

describe("Link", () => {
  it("is a link to its href", () => {
    render(<Link href="/billing">Billing</Link>);
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute("href", "/billing");
  });

  it("marks external links in the accessible name and opens them safely", () => {
    render(
      <Link href="https://example.com" isExternal>
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Docs (opens in a new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
