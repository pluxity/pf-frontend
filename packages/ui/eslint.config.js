import config from "@pf-dev/eslint-config/library";

export default [
  ...config,
  {
    ignores: [".storybook/**", "**/*.stories.tsx"],
  },
];
