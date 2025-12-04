import type { Preview } from "@storybook/react";
import "../src/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Getting Started",
          "Atoms",
          "Molecules",
          "Organisms",
          "Templates",
        ],
      },
    },
  },
};

export default preview;
