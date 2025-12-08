import baseConfig from "@pf-dev/eslint-config/base";
import reactConfig from "@pf-dev/eslint-config/react";

/** @type {import('eslint').Linter.Config[]} */
export default [...baseConfig, ...reactConfig];
