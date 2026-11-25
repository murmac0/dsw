import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

const code = 'import { Button } from "@dsw/ui";';

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

describe("CodeBlock", () => {
  it("shows the code and its title", () => {
    render(<CodeBlock code={code} title="App.tsx" />);
    expect(screen.getByText(code)).toBeInTheDocument();
    expect(screen.getByText("App.tsx")).toBeInTheDocument();
  });

  it("renders highlighted tokens as the same text", () => {
    const { container } = render(
      <CodeBlock
        code={code}
        tokens={[
          [
            { text: "import", kind: "keyword" },
            { text: " { Button } " },
            { text: "from", kind: "keyword" },
            { text: ' "@dsw/ui"', kind: "string" },
            { text: ";" },
          ],
        ]}
      />,
    );
    expect(container.querySelector("code")).toHaveTextContent(code);
  });

  it("names its copy button after the title, starting with the visible word", () => {
    render(<CodeBlock code={code} title="App.tsx" />);
    expect(screen.getByRole("button", { name: "Copy App.tsx" })).toHaveTextContent("Copy");
  });

  it("copies the code and announces it, then resets", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    mockClipboard(writeText);
    render(<CodeBlock code={code} title="App.tsx" />);

    await userEvent.click(screen.getByRole("button", { name: "Copy App.tsx" }));
    expect(writeText).toHaveBeenCalledWith(code);
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(screen.getByRole("button", { name: "Copied App.tsx" })).toBeInTheDocument();

    // The label goes back after two seconds.
    await act(() => new Promise((r) => setTimeout(r, 2100)));
    expect(screen.getByRole("button", { name: "Copy App.tsx" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("says so when the clipboard refuses", async () => {
    mockClipboard(() => Promise.reject(new Error("denied")));
    render(<CodeBlock code={code} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Couldn't copy/);
  });

  it("can drop the copy button and its live region", () => {
    render(<CodeBlock code="npm install @dsw/ui" showCopy={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("localises its labels", async () => {
    mockClipboard(() => Promise.resolve());
    render(<CodeBlock code={code} copyLabel="Kopieren" copiedLabel="Kopiert" />);
    await userEvent.click(screen.getByRole("button", { name: "Kopieren" }));
    expect(screen.getByRole("status")).toHaveTextContent("Kopiert");
  });
});
