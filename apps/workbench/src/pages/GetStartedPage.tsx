import { Card, CodeBlock, Grid, Link, Stack, Text } from "@dsw/ui";
import { DocSection, FileLink, REPO } from "../docs";
import { href } from "../routes";
import startSh from "../../snippets/start.sh?example";
import beforePrSh from "../../snippets/before-pr.sh?example";
import installSh from "../../snippets/install.sh?example";
import mcpSh from "../../snippets/mcp.sh?example";
import viteConfig from "../../snippets/vite.config.ts?example";
import mainTsx from "../../snippets/main.tsx?example";
import eslintConfig from "../../snippets/eslint.config.js?example";

/** Task-ordered setup: start an app, add the system to one, set up agents. */
export function GetStartedPage() {
  return (
    <Stack gap="xxl">
      <DocSection
        id="start-new"
        title="Start a new app"
        intro="The starter is a Vite and React app already wired up the way an app team should start: themes, lint, agent instructions and a smoke test."
      >
        <Stack gap="md">
          <Text>
            Copy <FileLink path="templates/starter" />, then:
          </Text>
          <CodeBlock {...startSh} />
          <Text>Before a pull request:</Text>
          <CodeBlock {...beforePrSh} />
        </Stack>
      </DocSection>

      <DocSection
        id="start-existing"
        title="Add it to an existing app"
        intro="Four steps. The packages ship StyleX source, which your build compiles with your own code."
      >
        <Grid as="ol" columns={2} gap="lg">
          <Card as="li" title="1. Install" titleLevel={3}>
            <CodeBlock {...installSh} />
          </Card>
          <Card as="li" title="2. Compile StyleX" titleLevel={3}>
            <CodeBlock {...viteConfig} />
          </Card>
          <Card as="li" title="3. Load fonts and a theme" titleLevel={3}>
            <CodeBlock {...mainTsx} />
          </Card>
          <Card as="li" title="4. Turn on the rules" titleLevel={3}>
            <CodeBlock {...eslintConfig} />
          </Card>
        </Grid>
      </DocSection>

      <DocSection
        id="start-agents"
        title="Set up your coding agent"
        intro="Give the agent the system's instructions and its MCP server, so it uses real components and tokens instead of guessing."
      >
        <Grid columns={2} gap="lg">
          <Card title="Any agent" titleLevel={3}>
            <Stack gap="sm">
              <Text size="sm">
                Copy the starter&apos;s <FileLink path="templates/starter/AGENTS.md" label="AGENTS.md" />{" "}
                into your repo. Cursor, Copilot and Codex read it directly. Then
                register the MCP server:
              </Text>
              <CodeBlock {...mcpSh} />
            </Stack>
          </Card>
          <Card title="Claude Code" titleLevel={3}>
            <Stack gap="sm">
              <Text size="sm">
                Install the plugin: it adds the MCP server and the build-screen,
                review-ui and migrate-to-dsw skills.
              </Text>
              <CodeBlock
                title="Claude Code"
                code={`/plugin marketplace add ${REPO}\n/plugin install dsw@dsw`}
              />
            </Stack>
          </Card>
        </Grid>
        <Text>
          <Link href={href("/ai")}>What agents read and can ask</Link>
        </Text>
      </DocSection>

      <DocSection id="start-next" title="Next">
        <Stack as="ul" gap="sm">
          <Stack as="li" gap="none">
            <Text>
              <Link href={href("/patterns/settings-page")}>The settings page example</Link>
              : a full page with no CSS of its own, the pattern to copy.
            </Text>
          </Stack>
          <Stack as="li" gap="none">
            <Text>
              <Link href={href("/foundations")}>Tokens and themes</Link>: pick
              values by role, never by hex.
            </Text>
          </Stack>
        </Stack>
      </DocSection>
    </Stack>
  );
}
