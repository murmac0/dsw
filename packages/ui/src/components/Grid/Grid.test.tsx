import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid } from "./Grid";

describe("Grid", () => {
  it("renders as a list of cells when asked", () => {
    render(
      <Grid as="ul" columns={3} aria-label="Plans">
        <li>Free</li>
        <li>Pro</li>
        <li>Team</li>
      </Grid>,
    );
    expect(screen.getByRole("list", { name: "Plans" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
