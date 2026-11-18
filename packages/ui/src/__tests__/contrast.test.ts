import { describe, expect, it } from "vitest";
import { contrastRatio, parseColor } from "@dsw/tokens/contrast";

const ratio = (a: string, b: string) => {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) throw new Error("unparseable");
  return contrastRatio(ca, cb);
};

describe("contrast math (WCAG 2.x)", () => {
  it("matches reference values", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(ratio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    // #767676 is the canonical lightest grey that passes 4.5:1 on white.
    expect(ratio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#777777", "#ffffff")).toBeLessThan(4.5);
  });

  it("is symmetric and parses computed-style formats", () => {
    expect(ratio("rgb(106, 88, 238)", "#fff")).toBeCloseTo(ratio("#fff", "#6a58ee"), 10);
    expect(parseColor("rgba(1, 2, 3, 0.5)")).toEqual([1, 2, 3]);
    expect(parseColor("not a colour")).toBeNull();
  });
});
