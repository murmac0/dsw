import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its title as a heading at the given level", () => {
    render(<Card title="Billing" titleLevel={3} description="Invoices and plan." />);
    expect(screen.getByRole("heading", { level: 3, name: "Billing" })).toBeInTheDocument();
    expect(screen.getByText("Invoices and plan.")).toBeInTheDocument();
  });

  it("as a section, becomes a region named by its title", () => {
    render(<Card as="section" title="Danger zone" tone="danger" />);
    expect(screen.getByRole("region", { name: "Danger zone" })).toBeInTheDocument();
  });

  it("is not a landmark by default", () => {
    render(<Card title="Plain" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});
