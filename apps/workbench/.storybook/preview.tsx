import type { Preview } from "@storybook/react-vite";
import "@dsw/tokens/fonts";
import "../src/global.css";
import { ThemeProvider } from "../src/theme/ThemeProvider";

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
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