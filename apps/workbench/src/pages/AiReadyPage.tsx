import site from "@dsw/mcp/generated/site.json";
import tokenExport from "@dsw/tokens/generated/tokens.json";
import { Badge, Card, CodeBlock, Grid, Heading, Inline, Link, Stack, Text } from "@dsw/ui";
import { FileLink, fmt } from "../docs";
import { href } from "../routes";

/**
 * How coding agents use the design system. Every number and every MCP
 * answer comes from packages/mcp/generated/site.json, which the real
 * server and the real agent files produce (and `pnpm test` keeps current).
 */
export function AiReadyPage() {
  const { checked, files, problems } = site.check;
  return (
    <Stack gap="xxl">
      <Text>
        {problems === 0 ? "No stale references" : `${problems} stale references`}{" "}
        across {files} agent files today: {checked.components} components,{" "}
        {checked.props} props, {checked.values} prop values and {checked.tools}{" "}
        MCP tool names are checked against the real ones on every push. The
        same rules agents check with run in CI:{" "}
        <Link href={href("/lint")}>lint rules and codemod</Link>.
      </Text>
      <WhatAgentsRead />
      <AskTheServer />
    </Stack>
  );
}

/* ------------------------------------------------------------------ */

function WhatAgentsRead() {
  const { alwaysOn, onDemand } = site.agentFiles;
  return (
    <Stack as="section" gap="lg" aria-labelledby="ai-read">
      <Stack gap="xs">
        <Heading level={2} size="xl" id="ai-read">
          What agents read
        </Heading>
        <Text tone="muted">
          Agent context comes in tiers. Whatever is loaded on every turn costs
          on every turn, so it stays short; the detail lives in tiers that load
          only when a task needs them.
        </Text>
      </Stack>
      <Grid columns={2} gap="lg">
        <Card
          title="Always loaded"
          titleLevel={3}
          description="In context on every turn of every session."
        >
          <Stack as="ul" gap="md">
            {alwaysOn.map((f) => (
              <Stack as="li" gap="xxs" key={f.file}>
                <Inline gap="sm">
                  <FileLink path={f.file} />
                  <Text size="sm" tone="muted">
                    {fmt(f.words)} words, about {fmt(f.tokens)} tokens
                  </Text>
                </Inline>
                <Text size="sm">
                  {f.file === "AGENTS.md"
                    ? "The rules, for any agent. Cursor, Copilot and Codex read it directly."
                    : "One line, @AGENTS.md, imports it: Claude Code doesn't read AGENTS.md on its own, and a markdown link wouldn't load it."}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card
          title="On demand: skills"
          titleLevel={3}
          description="Only each skill's name and description sit in context until a task matches it."
        >
          <Stack as="ul" gap="md">
            {onDemand.map((s) => (
              <Stack as="li" gap="xxs" key={s.file}>
                <Inline gap="sm">
                  <FileLink path={s.file} />
                  <Badge tone={s.audience === "app" ? "accent" : "neutral"}>
                    {s.audience === "app" ? "App teams" : "DS team"}
                  </Badge>
                </Inline>
                <Text size="sm">
                  {s.description}{" "}
                  <Text as="span" size="sm" tone="muted">
                    ({fmt(s.words)} words)
                  </Text>
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card
          title="Live: the MCP server"
          titleLevel={3}
          description="Answers from the generated token and component data, so it can't drift from the release an app has installed."
        >
          <Stack as="ul" gap="sm">
            {site.tools.map((t) => (
              <Stack as="li" gap="xxs" key={t.name}>
                <Text as="code" mono size="sm" weight="semibold">
                  {t.name}
                </Text>
                <Text size="sm" tone="muted">
                  {t.description}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card
          title="Handed over"
          titleLevel={3}
          description="Nothing fetches these on its own: they work when you point an agent at them."
        >
          <Stack as="ul" gap="md">
            <Stack as="li" gap="xxs">
              <Link href="llms.txt">
                <Text as="code" mono size="sm">
                  llms.txt
                </Text>
              </Link>
              <Text size="sm">
                An index of the docs and data below, for pasting into any agent.
              </Text>
            </Stack>
            <Stack as="li" gap="xxs">
              <FileLink path="packages/tokens/generated/tokens.json" />
              <Text size="sm">
                {fmt(tokenExport.tokens.length)} tokens with their values in all{" "}
                {tokenExport.themes.length} themes, plus the contrast audit.
              </Text>
            </Stack>
            <Stack as="li" gap="xxs">
              <FileLink path="packages/tokens/generated/dtcg" />
              <Text size="sm">
                The same tokens as W3C Design Tokens (DTCG), one file per theme.
              </Text>
            </Stack>
            <Stack as="li" gap="xxs">
              <FileLink path="packages/ui/generated/components.json" />
              <Text size="sm">
                Every component's props, types, tokens and stories.
              </Text>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */

function AskTheServer() {
  return (
    <Stack as="section" gap="lg" aria-labelledby="ai-ask">
      <Stack gap="xs">
        <Heading level={2} size="xl" id="ai-ask">
          Ask the MCP server
        </Heading>
        <Text tone="muted">
          Questions an agent asks while building a screen, and the server&apos;s
          actual answers, captured from the real server.
        </Text>
      </Stack>
      <Grid columns={2} gap="lg">
        {site.examples.map((e) => (
          <Card
            key={e.ask}
            title={e.ask}
            titleLevel={3}
            actions={<Badge tone="accent">{e.tool}</Badge>}
          >
            <Stack gap="sm">
              <Text size="sm" tone="muted">
                Call:{" "}
                <Text
                  as="code"
                  mono
                  size="sm"
                >{`${e.tool}(${JSON.stringify(e.args).slice(0, 90)}${JSON.stringify(e.args).length > 90 ? "…" : ""})`}</Text>
              </Text>
              <CodeBlock code={e.response} showCopy={false} />
              {e.truncated > 0 && (
                <Text size="xs" tone="muted">
                  … and {e.truncated} more lines.
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
