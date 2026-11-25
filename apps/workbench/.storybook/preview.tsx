import type { Preview } from "@storybook/react-vite";
import "@dsw/tokens/fonts";
import "../src/global.css";
import { brands } from "@dsw/tokens/themes";
import type { BrandName, ColorMode } from "@dsw/tokens";
import { ThemeProvider } from "@dsw/ui";

const preview: Preview = {
  // Toolbar pickers: every story can be viewed in any brand × mode.
  globalTypes: {
    brand: {
      description: "Brand",
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: brands.map((b) => ({ value: b.id, title: b.label, right: b.tagline })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Colour mode",
      toolbar: {
        title: "Mode",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { brand: "iris", mode: "light" },
  decorators: [
    (Story, context) => (
      <ThemeProvider
        brand={(context.globals.brand as BrandName) ?? "iris"}
        theme={(context.globals.mode as ColorMode) ?? "light"}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // Fail the story (and CI) on accessibility violations rather than
      // only surfacing them in the test UI.
      test: "error",
    },
  },
};

export default preview;