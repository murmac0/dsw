import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import { Button, Heading, Inline, Link, Stack, Text, useTheme } from "@dsw/ui";
import { styles } from "./App.styles";
import { BrandSwitcher } from "./theme/BrandSwitcher";
import { href, routes, siteMap, usePath } from "./routes";

const SITE = "Design System Workbench";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const path = usePath();
  // Open for the page it was opened on, so following a link closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === path;
  const mainRef = useRef<HTMLElement>(null);

  const index = routes.findIndex((r) => r.path === path);
  const route = routes[index];
  const title = route ? (route.title ?? route.label) : "Page not found";

  // A route change is a page load to the reader: new title, top of the
  // page, and focus on the new h1 so screen readers announce where they
  // are (the first render keeps the browser's own initial focus).
  const firstRender = useRef(true);
  useEffect(() => {
    document.title = path === "/" ? SITE : `${title} · ${SITE}`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    const h1 = mainRef.current?.querySelector("h1");
    if (h1) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
  }, [path, title]);

  return (
    <>
      <a
        href={href(path)}
        {...stylex.props(styles.skipLink)}
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>

      <header {...stylex.props(styles.header)}>
        <a href={href("/")} {...stylex.props(styles.home)}>
          <span {...stylex.props(styles.logo)} aria-hidden="true" />
          <span {...stylex.props(styles.siteName)}>{SITE}</span>
        </a>
        <div {...stylex.props(styles.controls)}>
          <BrandSwitcher />
          <Button variant="secondary" size="sm" onPress={toggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </Button>
          <span {...stylex.props(styles.menuButton)}>
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              onPress={() => setMenuOpenOn(menuOpen ? null : path)}
            >
              Menu
            </Button>
          </span>
        </div>
      </header>

      <div {...stylex.props(styles.layout)}>
        <nav
          id="site-nav"
          aria-label="Site"
          {...stylex.props(styles.sidebar, !menuOpen && styles.sidebarClosed)}
        >
          <div {...stylex.props(styles.navGroups)}>
            {siteMap.map((group, g) => {
              const labelId = `nav-group-${g}`;
              return (
                <div key={group.label ?? g}>
                  {group.label && (
                    <p id={labelId} {...stylex.props(styles.groupLabel)}>
                      {group.label}
                    </p>
                  )}
                  <ul
                    {...(group.label && { "aria-labelledby": labelId })}
                    {...stylex.props(styles.navList)}
                  >
                    {group.routes.map((r) => {
                      const current = r.path === path;
                      return (
                        <li key={r.path}>
                          <a
                            href={href(r.path)}
                            aria-current={current ? "page" : undefined}
                            {...stylex.props(
                              styles.navLink,
                              current && styles.navLinkCurrent,
                            )}
                          >
                            {r.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </nav>

        <main ref={mainRef} tabIndex={-1} {...stylex.props(styles.main)}>
          <div {...stylex.props(styles.content)}>
            {route ? (
              <Stack gap="xxl">
                {route.path !== "/" && (
                  <Stack gap="sm">
                    {route.group && (
                      <Text size="sm" tone="accent" weight="semibold">
                        {route.group}
                      </Text>
                    )}
                    <Heading level={1} size="display2">
                      {title}
                    </Heading>
                    {route.lede && (
                      <Text size="lg" tone="muted">
                        {route.lede}
                      </Text>
                    )}
                  </Stack>
                )}
                {route.render()}
                <Pager index={index} />
              </Stack>
            ) : (
              <Stack gap="md">
                <Heading level={1} size="display2">
                  Page not found
                </Heading>
                <Text tone="muted">
                  There&apos;s no page at {path}.{" "}
                  <Link href={href("/")}>Go to the overview</Link>.
                </Text>
              </Stack>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

/** Previous and next pages, in sidebar order: a path through the docs. */
function Pager({ index }: { index: number }) {
  const prev = routes[index - 1];
  const next = routes[index + 1];
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next page">
      <Inline justify="between" gap="md">
        {prev ? (
          <Link href={href(prev.path)}>
            <span aria-hidden="true">← </span>
            {prev.title ?? prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={href(next.path)}>
            {next.title ?? next.label}
            <span aria-hidden="true"> →</span>
          </Link>
        )}
      </Inline>
    </nav>
  );
}
