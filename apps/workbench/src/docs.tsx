import * as stylex from "@stylexjs/stylex";
import { useId, useState, type ComponentType, type ReactNode } from "react";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  radius,
  space,
} from "@dsw/tokens/semantic.stylex";
import {
  Button,
  CodeBlock,
  Heading,
  Inline,
  Link,
  Stack,
  Text,
  type CodeToken,
} from "@dsw/ui";

/** Shared building blocks for the docs pages. */

export const REPO = "https://github.com/murmac0/dsw";
export const STORYBOOK = "https://murmac0.github.io/dsw/storybook/";
export const repoFile = (path: string) => `${REPO}/blob/main/${path}`;
export const fmt = (n: number) => n.toLocaleString("en-GB");

// @dsw/ui has no stat component, and the example frame is docs-only.
const styles = stylex.create({
  stats: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [breakpoints.mobile]: "repeat(2, minmax(0, 1fr))",
    },
    gap: space.md,
    margin: 0,
  },
  stat: {
    display: "flex",
    // The number reads first visually; in the DOM the label (dt) has to
    // come before its value (dd).
    flexDirection: "column-reverse",
    gap: space.xxs,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurface,
  },
  statLabel: {
    color: color.fgMuted,
    fontSize: fontSize.sm,
  },
  statValue: {
    margin: 0,
    color: color.fgDefault,
    fontFamily: fontFamily.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.none,
  },
  preview: {
    minWidth: 0,
    padding: { default: space.xl, [breakpoints.mobile]: space.md },
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderDefault,
    backgroundColor: color.bgSurface,
  },
});


export function FileLink({ path, label }: { path: string; label?: string }) {
  return (
    <Link href={repoFile(path)} isExternal>
      <Text as="code" mono size="sm">
        {label ?? path}
      </Text>
    </Link>
  );
}

/** An h2 section with an optional intro line. */
export function DocSection({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack as="section" gap="lg" aria-labelledby={id}>
      <Stack gap="xs">
        <Heading level={2} size="xl" id={id}>
          {title}
        </Heading>
        {intro && <Text tone="muted">{intro}</Text>}
      </Stack>
      {children}
    </Stack>
  );
}

export function Stats({ items }: { items: Array<{ value: string | number; label: string }> }) {
  return (
    <dl {...stylex.props(styles.stats)}>
      {items.map((item) => (
        <div key={item.label} {...stylex.props(styles.stat)}>
          <dt {...stylex.props(styles.statLabel)}>{item.label}</dt>
          <dd {...stylex.props(styles.statValue)}>
            {typeof item.value === "number" ? fmt(item.value) : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* Examples: one file each under src/examples, rendered live and shown as
   source from the same file (see vite-plugin-examples.ts). */

type ExampleSource = { title: string; code: string; tokens: CodeToken[][] };

const demos = import.meta.glob<{ default: ComponentType }>("./examples/**/*.tsx", {
  eager: true,
});
const sources = import.meta.glob<{ default: ExampleSource }>("./examples/**/*.tsx", {
  eager: true,
  query: "?example",
});

/** A live example, with its source one click away. `name` is its path under src/examples. */
export function Example({ name }: { name: string }) {
  const key = `./examples/${name}.tsx`;
  const Demo = demos[key]?.default;
  const source = sources[key]?.default;
  if (!Demo || !source) throw new Error(`No example at src/examples/${name}.tsx`);
  const [showCode, setShowCode] = useState(false);
  const codeId = useId();
  return (
    <Stack gap="sm">
      <div {...stylex.props(styles.preview)}>
        <Demo />
      </div>
      <Inline justify="end">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={showCode}
          aria-controls={codeId}
          // Several on a page: the file name tells them apart.
          aria-label={`${showCode ? "Hide code" : "Show code"}: ${source.title}`}
          onPress={() => setShowCode((open) => !open)}
        >
          {showCode ? "Hide code" : "Show code"}
        </Button>
      </Inline>
      <div id={codeId} hidden={!showCode}>
        {showCode && <CodeBlock {...source} />}
      </div>
    </Stack>
  );
}
