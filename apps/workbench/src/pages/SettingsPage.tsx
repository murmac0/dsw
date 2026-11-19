import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  Grid,
  Heading,
  Inline,
  Link,
  Select,
  SelectItem,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField,
  type BadgeTone,
} from "@dsw/ui";

/**
 * A complete product page built only from @dsw/ui: no StyleX, no CSS, no
 * raw values. If something here needed a one-off style, the system was
 * missing a piece. It doubles as the target for agents building screens.
 */
export function SettingsPage() {
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Inline gap="sm">
          <Heading level={2} size="display3">
            Settings
          </Heading>
          <Badge tone="accent">Pro plan</Badge>
        </Inline>
        <Text tone="muted">Manage how the Acme workspace works for everyone in it.</Text>
      </Stack>

      <Tabs defaultSelectedKey="general">
        <TabList aria-label="Settings sections">
          <Tab id="general">General</Tab>
          <Tab id="members">Members</Tab>
          <Tab id="billing">Billing</Tab>
        </TabList>
        <TabPanel id="general">
          <GeneralSettings />
        </TabPanel>
        <TabPanel id="members">
          <MembersSettings />
        </TabPanel>
        <TabPanel id="billing">
          <BillingSettings />
        </TabPanel>
      </Tabs>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */

function GeneralSettings() {
  const [isSaving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const save = () => {
    setSaved(false);
    setSaving(true);
    timer.current = setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 700);
  };

  return (
    <Stack gap="lg">
      {saved && (
        <Alert tone="success" title="Settings saved" announce onDismiss={() => setSaved(false)}>
          Changes are live for everyone in the workspace.
        </Alert>
      )}

      <Card
        title="Workspace"
        titleLevel={3}
        description="Shown to everyone you invite."
        footer={
          <Button isLoading={isSaving} onPress={save}>
            Save changes
          </Button>
        }
      >
        <Grid columns={2} gap="lg">
          <TextField label="Workspace name" defaultValue="Acme" isRequired />
          <TextField
            label="Workspace URL"
            defaultValue="acme"
            description="acme.dsw.app: changing it breaks old links."
          />
          <Select label="Data region" defaultValue="eu">
            <SelectItem id="eu">Europe (Frankfurt)</SelectItem>
            <SelectItem id="us">United States (Virginia)</SelectItem>
            <SelectItem id="ap">Asia Pacific (Sydney)</SelectItem>
          </Select>
          <Select label="Default language" defaultValue="en">
            <SelectItem id="en">English</SelectItem>
            <SelectItem id="de">Deutsch</SelectItem>
            <SelectItem id="pt">Português</SelectItem>
          </Select>
        </Grid>
      </Card>

      <Card title="Notifications" titleLevel={3} description="What we email workspace admins about.">
        <Stack gap="md">
          <Switch defaultSelected>Weekly usage summary</Switch>
          <Switch defaultSelected>New member joins</Switch>
          <Switch>Product updates</Switch>
        </Stack>
      </Card>

      <Card
        as="section"
        tone="danger"
        title="Danger zone"
        titleLevel={3}
        description="Deleting the workspace removes all projects, members and invoices. This can't be undone."
        footer={
          <DialogTrigger>
            <Button variant="danger">Delete workspace</Button>
            <Dialog title="Delete Acme?" role="alertdialog" size="sm">
              {({ close }) => (
                <>
                  <DialogBody>
                    All 14 projects and 6 members lose access immediately. This can&apos;t be
                    undone.
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
    </Stack>
  );
}

/* ------------------------------------------------------------------ */

interface Member {
  name: string;
  email: string;
  role: string;
  tone: BadgeTone;
}

const initialMembers: Member[] = [
  { name: "Ada Lovelace", email: "ada@acme.dev", role: "Owner", tone: "accent" },
  { name: "Grace Hopper", email: "grace@acme.dev", role: "Admin", tone: "neutral" },
  { name: "Alan Turing", email: "alan@acme.dev", role: "Member", tone: "neutral" },
  { name: "Katherine Johnson", email: "katherine@acme.dev", role: "Invited", tone: "warning" },
];

function MembersSettings() {
  const [members, setMembers] = useState(initialMembers);
  return (
    <Card
      title="Members"
      titleLevel={3}
      description={`${members.length} people have access to this workspace.`}
      actions={<InviteDialog />}
    >
      <Stack as="ul" gap="lg" aria-label="Members">
        {members.map((m) => (
          <Inline as="li" key={m.email} justify="between" gap="md">
            <Stack gap="none">
              <Text weight="semibold">{m.name}</Text>
              <Text size="sm" tone="muted">
                {m.email}
              </Text>
            </Stack>
            <Inline gap="sm">
              <Badge tone={m.tone}>{m.role}</Badge>
              {m.role !== "Owner" && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${m.name}`}
                  onPress={() => setMembers((all) => all.filter((x) => x.email !== m.email))}
                >
                  Remove
                </Button>
              )}
            </Inline>
          </Inline>
        ))}
      </Stack>
    </Card>
  );
}

function InviteDialog() {
  return (
    <DialogTrigger>
      <Button size="sm">Invite member</Button>
      <Dialog title="Invite a member" size="sm">
        {({ close }) => (
          <>
            <DialogBody>
              <Stack gap="lg">
                <TextField label="Email" type="email" autoComplete="off" isRequired />
                <Select label="Role" defaultValue="member">
                  <SelectItem id="member">Member</SelectItem>
                  <SelectItem id="admin">Admin</SelectItem>
                </Select>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button onPress={close}>Send invite</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

/* ------------------------------------------------------------------ */

const plans = [
  { id: "free", name: "Free", price: "€0", blurb: "For trying things out. 3 projects.", current: false },
  { id: "pro", name: "Pro", price: "€12", blurb: "For small teams. Unlimited projects.", current: true },
  { id: "team", name: "Team", price: "€29", blurb: "SSO, audit log and priority support.", current: false },
];

function BillingSettings() {
  return (
    <Stack gap="lg">
      <Alert tone="warning" title="Your trial ends in 3 days">
        <Text>
          Add a payment method to keep your projects. <Link href="#payment">Add a card</Link>
        </Text>
      </Alert>

      <Stack gap="md">
        <Heading level={3}>Plans</Heading>
        <Grid as="ul" columns={3} gap="lg" aria-label="Plans">
          {plans.map((p) => (
            <Card
              key={p.id}
              as="li"
              padding="md"
              title={p.name}
              titleLevel={4}
              actions={p.current ? <Badge tone="success">Current</Badge> : undefined}
              footer={
                <Button variant={p.current ? "secondary" : "primary"} isDisabled={p.current}>
                  {p.current ? "Your plan" : `Switch to ${p.name}`}
                </Button>
              }
            >
              <Stack gap="xs">
                <Text size="lg" weight="semibold">
                  {p.price}{" "}
                  <Text as="span" size="sm" tone="muted">
                    per member / month
                  </Text>
                </Text>
                <Text size="sm" tone="muted">
                  {p.blurb}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>

      <Card id="payment" title="Payment method" titleLevel={3}>
        <Stack gap="sm">
          <Text tone="muted">No card on file.</Text>
          <Inline gap="md">
            <Button variant="secondary">Add card</Button>
            <Link href="https://example.com/billing-faq" isExternal>
              Billing FAQ
            </Link>
          </Inline>
        </Stack>
      </Card>
    </Stack>
  );
}
