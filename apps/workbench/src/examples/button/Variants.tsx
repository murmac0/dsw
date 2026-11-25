import { Button, Inline } from "@dsw/ui";

export default function Variants() {
  return (
    <Inline gap="md">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </Inline>
  );
}
