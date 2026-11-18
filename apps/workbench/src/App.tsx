import * as stylex from "@stylexjs/stylex";
import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabRenderProps,
} from "react-aria-components";
import { Button } from "@dsw/ui";
import { styles } from "./App.styles";
import { ComponentsPage } from "./pages/ComponentsPage";
import { FoundationsPage } from "./pages/FoundationsPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { BrandSwitcher } from "./theme/BrandSwitcher";
import { useTheme } from "./theme/ThemeProvider";

function getTabClassName(renderProps: TabRenderProps): string {
  return (
    stylex.props(
      styles.tab,
      !renderProps.isSelected && renderProps.isHovered && styles.tabHovered,
      renderProps.isSelected && styles.tabSelected,
      renderProps.isFocusVisible && styles.tabFocusVisible,
    ).className ?? ""
  );
}

export function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tabs>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.brand)}>
          <span {...stylex.props(styles.logo)} aria-hidden="true" />
          <h1 {...stylex.props(styles.title)}>
            Design System{" "}
            <span {...stylex.props(styles.titleAccent)}>Workbench</span>
          </h1>
        </div>
        <div {...stylex.props(styles.controls)}>
          <BrandSwitcher />
          <Button variant="secondary" size="sm" onPress={toggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </Button>
        </div>
      </header>

      <TabList aria-label="Workbench sections" {...stylex.props(styles.tabList)}>
        <Tab id="components" className={getTabClassName}>
          Components
        </Tab>
        <Tab id="foundations" className={getTabClassName}>
          Foundations
        </Tab>
        <Tab id="playground" className={getTabClassName}>
          Playground
        </Tab>
      </TabList>

      <main {...stylex.props(styles.main)}>
        <TabPanel id="components">
          <ComponentsPage />
        </TabPanel>
        <TabPanel id="foundations">
          <FoundationsPage />
        </TabPanel>
        <TabPanel id="playground">
          <PlaygroundPage />
        </TabPanel>
      </main>
    </Tabs>
  );
}
