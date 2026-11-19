import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("is not a live region unless asked to announce", () => {
    render(<Alert title="Maintenance on Sunday" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces politely for info/success and assertively for warning/danger", () => {
    render(
      <>
        <Alert tone="success" title="Saved" announce />
        <Alert tone="danger" title="Payment failed" announce />
      </>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Success: Saved");
    expect(screen.getByRole("alert")).toHaveTextContent("Error: Payment failed");
  });

  it("states its tone in text, not only colour, and can be localised", () => {
    render(<Alert tone="warning" title="Trial ends soon" toneLabel="Achtung" />);
    expect(screen.getByText("Trial ends soon").parentElement).toHaveTextContent("Achtung: Trial ends soon");
  });

  it("calls onDismiss from a named dismiss button", async () => {
    const onDismiss = vi.fn();
    render(<Alert title="Saved" onDismiss={onDismiss} dismissLabel="Close message" />);
    await userEvent.click(screen.getByRole("button", { name: "Close message" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
