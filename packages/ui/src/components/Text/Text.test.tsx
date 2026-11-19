import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("renders a paragraph by default and other elements on request", () => {
    render(
      <>
        <Text>Para</Text>
        <Text as="strong">Strong</Text>
      </>,
    );
    expect(screen.getByText("Para").tagName).toBe("P");
    expect(screen.getByText("Strong").tagName).toBe("STRONG");
  });
});
