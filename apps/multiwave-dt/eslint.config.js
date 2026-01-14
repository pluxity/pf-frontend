import reactConfig from "@pf-dev/eslint-config/react";

export default [
  ...reactConfig,
  {
    ignores: ["scripts/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
