import reactConfig from "@pf-dev/eslint-config/react";

export default [
  { ignores: ["scripts/**"] },
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
