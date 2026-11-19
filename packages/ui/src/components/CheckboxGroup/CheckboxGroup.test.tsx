import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../Checkbox/Checkbox";
import { Fieldset } from "../Fieldset/Fieldset";
import { CheckboxGroup, type CheckboxGroupProps } from "./CheckboxGroup";

function Channels(props: Omit<CheckboxGroupProps, "label" | "children">) {
  return (
    <CheckboxGroup label="Notify me by" description="Pick any." {...props}>
      <Checkbox value="email">Email</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
      <Checkbox value="push">Push</Checkbox>
    </CheckboxGroup>
  );
}

describe("CheckboxGroup", () => {
  it("is a labelled, described group of checkboxes", () => {
    render(<Channels />);
    const group = screen.getByRole("group", { name: "Notify me by" });
    expect(group).toHaveAccessibleDescription("Pick any.");
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("uncontrolled: starts from defaultValue and reports the array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Channels defaultValue={["email"]} onChange={onChange} />);

    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: "Push" }));
    expect(onChange).toHaveBeenLastCalledWith(["email", "push"]);
    expect(screen.getByRole("checkbox", { name: "Push" })).toBeChecked();
  });

  it("controlled: reports changes but only the parent changes the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Channels value={["sms"]} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Email" }));
    expect(onChange).toHaveBeenCalledWith(["sms", "email"]);
    expect(screen.getByRole("checkbox", { name: "Email" })).not.toBeChecked();

    rerender(<Channels value={["sms", "email"]} onChange={onChange} />);
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked();
  });

  it("isRequired means at least one: required only while none is selected", async () => {
    const user = userEvent.setup();
    render(<Channels isRequired />);

    for (const box of screen.getAllByRole("checkbox")) expect(box).toBeRequired();
    await user.click(screen.getByRole("checkbox", { name: "SMS" }));
    for (const box of screen.getAllByRole("checkbox")) expect(box).not.toBeRequired();
  });

  it("links a group error to the group", () => {
    render(<Channels isInvalid errorMessage="Choose at least one channel." />);
    expect(screen.getByRole("group", { name: "Notify me by" })).toHaveAccessibleDescription(
      /Choose at least one channel/,
    );
  });

  it("inherits disabled state from a Fieldset", () => {
    render(
      <Fieldset legend="Notifications" isDisabled>
        <Channels />
      </Fieldset>,
    );
    for (const box of screen.getAllByRole("checkbox")) expect(box).toBeDisabled();
  });

  it("announces required in the group's name (aria-required isn't allowed on a group)", () => {
    render(<Channels isRequired defaultValue={["email"]} />);
    // Still conveyed when an option is ticked and the boxes drop `required`.
    expect(
      screen.getByRole("group", { name: "Notify me by, required" }),
    ).toBeInTheDocument();
  });
});
