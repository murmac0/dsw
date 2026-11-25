import site from "@dsw/mcp/generated/site.json";
import { Badge, Card, CodeBlock, Grid, Stack, Text, type BadgeTone } from "@dsw/ui";
import { DocSection, FileLink } from "../docs";
import eslintConfig from "../../snippets/eslint.config.js?example";
import codemodSh from "../../snippets/codemod.sh?example";

/** The ESLint rules and the codemod built on them. Rules come from the plugin itself. */
export function LintPage() {
  const levelTone = (level: string): BadgeTone =>
    level === "error" ? "danger" : level === "warn" ? "warning" : "neutral";
  const lintExample = site.examples.find((e) => e.tool === "lint_styles");
  return (
    <Stack gap="xxl">
      <DocSection
        id="lint-one-set"
        title="One set of rules, four places"
        intro="App teams' CI, their editors, the MCP server's lint_styles tool and the dsw-migrate codemod all run the same rules from @dsw/eslint-plugin, so an agent checks its code against exactly what CI will enforce."
      >
        <Grid columns={2} gap="lg">
          <Card title="CI and editors" titleLevel={3}>
            <CodeBlock {...eslintConfig} />
          </Card>
          <Card title="The codemod" titleLevel={3}>
            <Stack gap="sm">
              <CodeBlock {...codemodSh} />
              <Text size="sm">
                Applies only the fixes that can&apos;t change behaviour, and lists the
                rest for a person (or the migrate-to-dsw skill) to finish.
              </Text>
            </Stack>
          </Card>
        </Grid>
      </DocSection>

      <DocSection
        id="lint-rules"
        title="The rules, with examples"
        intro="The recommended preset for apps. Each example is run through the linter when the site is built: the flagged code must trip the rule, and the code beside it must pass every rule."
      >
        <Stack gap="lg">
          {site.rules.map((r) => (
            <Card
              key={r.id}
              title={r.id}
              titleLevel={3}
              actions={<Badge tone={levelTone(r.level)}>{r.level}</Badge>}
              description={`${r.description}.`}
            >
              <Stack gap="md">
                <Grid columns={2} gap="md">
                  <Stack gap="xs">
                    <Text size="sm" weight="semibold" tone="danger">
                      Flagged
                    </Text>
                    <CodeBlock code={r.example.flagged} showCopy={false} />
                  </Stack>
                  <Stack gap="xs">
                    <Text size="sm" weight="semibold" tone="success">
                      Instead
                    </Text>
                    <CodeBlock code={r.example.instead} title={r.id.replace("@dsw/", "")} />
                  </Stack>
                </Grid>
                <Text size="sm" tone="muted">
                  The linter says: {r.example.message}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      </DocSection>

      {lintExample && (
        <DocSection
          id="lint-agent"
          title="What an agent sees"
          intro="A snippet with a primitive token and hand-written spacing, sent to the MCP server's lint_styles tool. This is its real answer."
        >
          <Grid columns={2} gap="lg">
            <Card title="Code" titleLevel={3}>
              <CodeBlock code={String(lintExample.args.code)} title="snippet.tsx" />
            </Card>
            <Card title="lint_styles" titleLevel={3}>
              <CodeBlock code={lintExample.response} showCopy={false} />
            </Card>
          </Grid>
        </DocSection>
      )}

      <Text tone="muted">
        Source: <FileLink path="packages/eslint-plugin" />. Every rule change is a
        change to app teams&apos; CI, so each behaviour has RuleTester cases.
      </Text>
    </Stack>
  );
}
