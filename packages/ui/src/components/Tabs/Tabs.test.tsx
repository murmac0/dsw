import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from "./Tabs";

function Example(props: Partial<TabsProps>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Settings sections">
        <Tab id="general">General</Tab>
        <Tab id="members">Members</Tab>
        <Tab id="billing" isDisabled>Billing</Tab>
      </TabList>
      <TabPanel id="general">General panel</TabPanel>
      <TabPanel id="members">Members panel</TabPanel>
      <TabPanel id="billing">Billing panel</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("has tab semantics and switches panels with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(screen.getByRole("tablist", { name: "Settings sections" })).toBeInTheDocument();
    const general = screen.getByRole("tab", { name: "General" });
    expect(general).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("General panel");

    await user.tab();
    expect(general).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Members" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Members" })).toHaveTextContent("Members panel");
  });

  it("skips disabled tabs", async () => {
    const user = userEvent.setup();
    render(<Example defaultSelectedKey="members" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    // Wraps past the disabled Billing tab to General.
    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute("aria-selected", "true");
  });

  it("works controlled", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [key, setKey] = useState<Key>("members");
      return (
        <Example
          selectedKey={key}
          onSelectionChange={(k) => {
            onChange(k);
            setKey(k);
          }}
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("tab", { name: "Members" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByRole("tab", { name: "General" }));
    expect(onChange).toHaveBeenCalledWith("general");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("General panel");
  });
});
