import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function Controls() {
  const { brand, theme, setBrand, toggleTheme } = useTheme();
  return (
    <>
      <p>
        {brand} {theme}
      </p>
      <button onClick={() => setBrand("volt")}>Volt</button>
      <button onClick={toggleTheme}>Toggle mode</button>
    </>
  );
}

const root = document.documentElement;

afterEach(() => {
  window.localStorage.clear();
});

describe("ThemeProvider", () => {
  it("puts the theme on <html> and updates it (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultBrand="bloom">
        <Controls />
      </ThemeProvider>,
    );
    expect(root.dataset.brand).toBe("bloom");
    expect(root.dataset.theme).toBe("light");
    expect(root.className).not.toBe("");

    await user.click(screen.getByRole("button", { name: "Toggle mode" }));
    expect(screen.getByText("bloom dark")).toBeInTheDocument();
    expect(root.dataset.theme).toBe("dark");
  });

  it("remembers the viewer's choice unless persist is off", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <ThemeProvider>
        <Controls />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Volt" }));
    unmount();

    render(
      <ThemeProvider>
        <Controls />
      </ThemeProvider>,
    );
    expect(screen.getByText("volt light")).toBeInTheDocument();
  });

  it("reports changes and follows its props when controlled", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    function App() {
      const [theme, setTheme] = useState<"light" | "dark">("light");
      return (
        <ThemeProvider
          theme={theme}
          onThemeChange={(t) => {
            onThemeChange(t);
            setTheme(t);
          }}
        >
          <Controls />
        </ThemeProvider>
      );
    }
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Toggle mode" }));
    expect(onThemeChange).toHaveBeenCalledWith("dark");
    expect(root.dataset.theme).toBe("dark");
  });

  it("doesn't change a controlled value without the app's say-so", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider brand="iris">
        <Controls />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Volt" }));
    expect(root.dataset.brand).toBe("iris");
  });
});
