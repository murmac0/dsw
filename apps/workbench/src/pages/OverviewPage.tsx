import site from "@dsw/mcp/generated/site.json";
import tokenExport from "@dsw/tokens/generated/tokens.json";
import { Badge, Card, CodeBlock, Grid, Heading, Inline, Link, Stack, Text } from "@dsw/ui";
import { DocSection, REPO, STORYBOOK, Stats, fmt, repoFile } from "../docs";
import { href } from "../routes";
import { catalog } from "./ComponentsIndexPage";

/**
 * The home page: what the system is, how its parts fit together, how it
 * works with coding agents, and how it's kept honest. Each section is a
 * summary that links to the page with the detail.
 */
export function OverviewPage() {
  const brandCount = tokenExport.brands.length;
  return (
    <Stack gap="xxl">
      <Hero />

      <Stats
        items={[
          { value: catalog.length, label: "components" },
          { value: tokenExport.tokens.length, label: "design tokens" },
          { value: `${brandCount} × 2`, label: "brands × light and dark" },
          { value: tokenExport.contrast.length, label: "contrast pairs, every theme" },
          { value: site.rules.length, label: "lint rules" },
          { value: site.tools.length, label: "MCP tools for agents" },
        ]}
      />

      <HowItFits />
      <ForAgents />
      <QualityGates />

      <DocSection id="overview-more" title="Read more">
        <Stack as="ul" gap="sm">
          <Stack as="li" gap="none">
            <Text>
              <Link href={repoFile("ARCHITECTURE.md")} isExternal>
                Architecture
              </Link>
              : why tokens come in three tiers, why brands are complete theme
              lists, how agents use the system.
            </Text>
          </Stack>
          <Stack as="li" gap="none">
            <Text>
              <Link href={repoFile("ACCESSIBILITY.md")} isExternal>
                Accessibility review
              </Link>
              : method, findings and fixes, and what still needs a person.
            </Text>
          </Stack>
          <Stack as="li" gap="none">
            <Text>
              <Link href={STORYBOOK} isExternal>
                Storybook
              </Link>
              : every component&apos;s stories, with the accessibility add-on.
            </Text>
          </Stack>
        </Stack>
      </DocSection>
    </Stack>
  );
}

function Hero() {
  return (
    <Stack gap="lg">
      <Inline gap="sm">
        <Badge tone="accent">React 19</Badge>
        <Badge tone="neutral">StyleX</Badge>
        <Badge tone="neutral">React Aria</Badge>
        <Badge tone="neutral">WCAG 2.2 AA</Badge>
        <Badge tone="neutral">MCP</Badge>
      </Inline>
      <Heading level={1} size="display1">
        A design system for people and their coding agents
      </Heading>
      <Text size="lg" tone="muted">
        Themeable tokens, accessible React components, lint rules that keep
        code on-system, and an MCP server and agent instructions so that
        Claude Code, Cursor or Copilot build with it as reliably as a person
        does. Everything on this site is generated from the repo, and the
        build fails if it drifts.
      </Text>
      <Inline gap="lg">
        <Link href={href("/get-started")}>Get started</Link>
        <Link href={href("/ai")}>How agents use it</Link>
        <Link href={REPO} isExternal>
          Source on GitHub
        </Link>
      </Inline>
    </Stack>
  );
}

const LAYERS: Array<{
  name: string;
  pkg: string;
  path: string;
  linkLabel: string;
  body: string;
}> = [
  {
    name: "Tokens",
    pkg: "@dsw/tokens",
    path: "/foundations",
    linkLabel: "Tokens and themes",
    body: "Primitives, semantic roles and per-component tokens in StyleX. Three brands, each in light and dark, that change shape and type as well as colour. Exported as JSON and W3C DTCG.",
  },
  {
    name: "Components",
    pkg: "@dsw/ui",
    path: "/components",
    linkLabel: "Components",
    body: "React components on React Aria: keyboard, focus and screen-reader behaviour come built in. Layout and type primitives mean a page needs no CSS of its own.",
  },
  {
    name: "Rules",
    pkg: "@dsw/eslint-plugin",
    path: "/lint",
    linkLabel: "Lint rules and codemod",
    body: "Tokens only, design-system components over native elements, layout primitives over hand-written flexbox. A codemod applies the safe fixes to existing apps.",
  },
  {
    name: "Agent layer",
    pkg: "@dsw/mcp",
    path: "/ai",
    linkLabel: "AI agents",
    body: "An MCP server that answers from the generated data, AGENTS.md for any agent, skills for building, reviewing and migrating screens, and a Claude Code plugin that installs them.",
  },
  {
    name: "Proof",
    pkg: "templates/starter",
    path: "/get-started",
    linkLabel: "Get started",
    body: "A starter app, and a test that packs every package, installs it there from scratch and runs its checks: the release works outside this repo.",
  },
];

function HowItFits() {
  return (
    <DocSection
      id="overview-layers"
      title="How it fits together"
      intro="Five layers, each built on the one before. The same generated data feeds the components, the docs, the lint rules and the agents, so they can't disagree."
    >
      <Grid as="ol" columns={2} gap="lg">
        {LAYERS.map((layer, i) => (
          <Card
            as="li"
            key={layer.name}
            title={`${i + 1}. ${layer.name}`}
            titleLevel={3}
            actions={<Badge tone="neutral">{layer.pkg}</Badge>}
            footer={<Link href={href(layer.path)}>{layer.linkLabel}</Link>}
          >
            <Text size="sm">{layer.body}</Text>
          </Card>
        ))}
      </Grid>
    </DocSection>
  );
}

function ForAgents() {
  const { alwaysOn, onDemand } = site.agentFiles;
  const agentsMd = alwaysOn.find((f) => f.file === "AGENTS.md");
  const tooltip = site.examples.find((e) => e.ask === "Is there a tooltip?");
  return (
    <DocSection
      id="overview-ai"
      title="Built for AI coding agents"
      intro="Agents follow instructions faithfully, including stale ones. So what they read is kept short, what they ask is answered from live data, and what they write is checked by the same rules as everyone else's code."
    >
      <Grid columns={2} gap="lg">
        <Card title="What they read" titleLevel={3}>
          <Text size="sm">
            <Text as="code" mono size="sm">
              AGENTS.md
            </Text>{" "}
            ({fmt(agentsMd?.words ?? 0)} words) on every turn, read directly by
            Cursor, Copilot and Codex and imported by Claude Code&apos;s
            CLAUDE.md. {onDemand.length} skills load only when a task needs
            them.
          </Text>
        </Card>
        <Card title="What they can ask" titleLevel={3}>
          <Text size="sm">
            {site.tools.length} MCP tools: find a component for a need, read
            its props, map a hex value to a token, check contrast in every
            theme, and lint code against CI&apos;s rules before finishing.
          </Text>
        </Card>
        <Card title="What they hand over" titleLevel={3}>
          <Text size="sm">
            An{" "}
            <Link href="llms.txt">
              llms.txt
            </Link>{" "}
            index, the token export, W3C DTCG files and the component manifest,
            for agents that don&apos;t speak MCP.
          </Text>
        </Card>
        <Card title="How it stays true" titleLevel={3}>
          <Text size="sm">
            Every component, prop and tool named in the agent files is checked
            against the real ones on every push: {site.check.problems === 0 ? "no" : site.check.problems}{" "}
            stale references today.
          </Text>
        </Card>
      </Grid>
      {tooltip && (
        <Card
          title={`Asked "${tooltip.ask}", the server says:`}
          titleLevel={3}
          actions={<Badge tone="accent">{tooltip.tool}</Badge>}
        >
          <CodeBlock code={tooltip.response.split("\n")[0] ?? ""} showCopy={false} />
        </Card>
      )}
      <Text>
        <Link href={href("/ai")}>See every tool and its real answers</Link>
      </Text>
    </DocSection>
  );
}

function QualityGates() {
  const { checked, files } = site.check;
  return (
    <DocSection
      id="overview-checks"
      title="Checked on every push"
      intro="CI runs these on every change. Each one was checked against the bug it guards: undo the fix and the test fails."
    >
      <Grid columns={2} gap="lg">
        <Card title="Accessibility in all six themes" titleLevel={3}>
          <Text size="sm">
            axe at WCAG 2.2 AA on every page and open overlay, forced-colours
            states compared pixel by pixel, reflow at 320px, text spacing, and
            accessibility-tree snapshots of what screen readers receive.
          </Text>
        </Card>
        <Card title="Contrast" titleLevel={3}>
          <Text size="sm">
            {tokenExport.contrast.length} colour pairings, each in all{" "}
            {tokenExport.themes.length} themes: 4.5:1 for text, 3:1 for UI.
            Agents get the same check through check_contrast.
          </Text>
        </Card>
        <Card title="A release works in a fresh app" titleLevel={3}>
          <Text size="sm">
            Every package is packed and installed into the starter outside the
            repo, then typechecked, linted, built and smoke-tested, along with
            the MCP server, the codemod and every lint rule.
          </Text>
        </Card>
        <Card title="Docs can't go stale" titleLevel={3}>
          <Text size="sm">
            Generated token, component and site data must match the source,
            and {files} agent files are checked: {checked.components}{" "}
            components, {checked.props} props and {checked.tools} tool names.
          </Text>
        </Card>
      </Grid>
      <Text>
        <Link href={href("/accessibility")}>How accessibility is tested</Link>
      </Text>
    </DocSection>
  );
}
