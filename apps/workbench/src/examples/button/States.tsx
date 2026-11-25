import { useState } from "react";
import { Button, Inline } from "@dsw/ui";

export default function States() {
  const [isSaving, setIsSaving] = useState(false);

  // A spinner only shows while work is in progress, and this one stops
  // on its own: moving content over 5s needs a pause control (WCAG 2.2.2).
  const save = () => {
    setIsSaving(true);
    window.setTimeout(() => setIsSaving(false), 3000);
  };

  return (
    <Inline gap="md">
      <Button>Default</Button>
      <Button isDisabled>Disabled</Button>
      <Button variant="secondary" isLoading={isSaving} onPress={save}>
        Save draft
      </Button>
    </Inline>
  );
}
