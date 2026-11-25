import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  Grid,
  Heading,
  Inline,
  Select,
  SelectItem,
  Stack,
  Switch,
  Text,
  TextField,
  useTheme,
} from "@dsw/ui";
import { brands } from "@dsw/tokens/themes";
import type { BrandName } from "@dsw/tokens";

/**
 * A starting screen built only from @dsw/ui: no styles of its own.
 * Replace it with your app; keep the pattern.
 */
export function App() {
  return (
    <Container as="main">
      <Stack gap="xl">
        <Inline justify="between" align="center" stackOnMobile>
          <Heading level={1}>Your workspace</Heading>
          <Appearance />
        </Inline>
        <Grid columns={2} gap="lg">
          <Profile />
          <Plan />
        </Grid>
        <DangerZone />
      </Stack>
    </Container>
  );
}

function Appearance() {
  const { brand, setBrand, theme, setTheme } = useTheme();
  return (
    <Inline gap="md" align="end" wrap>
      <Select
        label="Brand"
        value={brand}
        onChange={(key) => {
          const next = brands.find((b) => b.id === key);
          if (next) setBrand(next.id satisfies BrandName);
        }}
      >
        {brands.map((b) => (
          <SelectItem key={b.id} id={b.id}>
            {b.label}
          </SelectItem>
        ))}
      </Select>
      <Switch
        isSelected={theme === "dark"}
        onChange={(on) => setTheme(on ? "dark" : "light")}
      >
        Dark mode
      </Switch>
    </Inline>
  );
}

function Profile() {
  const [saved, setSaved] = useState(false);
  return (
    <Card
      as="section"
      title="Profile"
      titleLevel={2}
      description="How teammates see you."
      footer={
        <Button type="submit" form="profile" variant="primary">
          Save profile
        </Button>
      }
    >
      <form
        id="profile"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Stack gap="lg">
          {saved && (
            <Alert
              tone="success"
              title="Profile saved"
              announce
              onDismiss={() => setSaved(false)}
            >
              Teammates will see the change straight away.
            </Alert>
          )}
          <TextField
            label="Full name"
            name="name"
            autoComplete="name"
            defaultValue="Ada Lovelace"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            isRequired
            defaultValue="ada@example.com"
          />
        </Stack>
      </form>
    </Card>
  );
}

function Plan() {
  return (
    <Card
      as="section"
      title="Plan"
      titleLevel={2}
      actions={<Badge tone="success">Active</Badge>}
      footer={<Button variant="secondary">Change plan</Button>}
    >
      <Stack gap="sm">
        <Text weight="semibold">Team, 6 seats</Text>
        <Text tone="muted">Renews on 1 March. You're using 4 of 6 seats.</Text>
      </Stack>
    </Card>
  );
}

function DangerZone() {
  return (
    <Card
      as="section"
      tone="danger"
      title="Danger zone"
      titleLevel={2}
      description="Deleting the workspace removes every project and member. This can't be undone."
      footer={
        <DialogTrigger>
          <Button variant="danger">Delete workspace</Button>
          <Dialog title="Delete this workspace?" role="alertdialog" size="sm">
            {({ close }) => (
              <>
                <DialogBody>
                  Everyone loses access immediately. This can't be undone.
                </DialogBody>
                <DialogFooter>
                  <Button variant="secondary" onPress={close}>
                    Cancel
                  </Button>
                  <Button variant="danger" onPress={close}>
                    Delete workspace
                  </Button>
                </DialogFooter>
              </>
            )}
          </Dialog>
        </DialogTrigger>
      }
    />
  );
}
