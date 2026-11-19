import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Inline } from "./Inline";

describe("Inline", () => {
  it("renders the requested element with its children", () => {
    render(
      <Inline as="nav" aria-label="Pagination">
        <a href="#1">1</a>
        <a href="#2">2</a>
      </Inline>,
    );
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav.children).toHaveLength(2);
  });
});
