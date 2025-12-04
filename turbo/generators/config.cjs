/** @type {import('@turbo/gen').PlopTypes.NodePlopAPI} */
module.exports = function generator(plop) {
  plop.setGenerator("app", {
    description: "Create a new React application",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the new app?",
        validate: function (input) {
          if (!input) return "App name is required";
          if (!/^[a-z0-9-]+$/.test(input))
            return "App name must be lowercase with hyphens only";
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Brief description of the app:",
        default: "A new React application",
      },
      {
        type: "input",
        name: "port",
        message: "Development server port:",
        default: "3000",
        validate: function (input) {
          const port = parseInt(input, 10);
          if (isNaN(port) || port < 1000 || port > 65535)
            return "Port must be a number between 1000 and 65535";
          return true;
        },
      },
    ],
    actions: [
      // Package files
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/package.json",
        templateFile: "templates/app/package.json.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/tsconfig.json",
        templateFile: "templates/app/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/vite.config.ts",
        templateFile: "templates/app/vite.config.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/index.html",
        templateFile: "templates/app/index.html.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/eslint.config.js",
        templateFile: "templates/app/eslint.config.js.hbs",
      },
      // Environment files
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.development",
        templateFile: "templates/app/env/.env.development.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.staging",
        templateFile: "templates/app/env/.env.staging.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.production",
        templateFile: "templates/app/env/.env.production.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.example",
        templateFile: "templates/app/env/.env.example.hbs",
      },
      // Source files
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/main.tsx",
        templateFile: "templates/app/src/main.tsx.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/App.tsx",
        templateFile: "templates/app/src/App.tsx.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/styles/globals.css",
        templateFile: "templates/app/src/styles/globals.css.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/vite-env.d.ts",
        templateFile: "templates/app/src/vite-env.d.ts.hbs",
      },
      // Config
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/config/env.ts",
        templateFile: "templates/app/src/config/env.ts.hbs",
      },
      // Router
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/routes/index.tsx",
        templateFile: "templates/app/src/routes/index.tsx.hbs",
      },
      // Layouts
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/layouts/RootLayout.tsx",
        templateFile: "templates/app/src/layouts/RootLayout.tsx.hbs",
      },
      // Pages
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/index.ts",
        templateFile: "templates/app/src/pages/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/home/index.tsx",
        templateFile: "templates/app/src/pages/home/index.tsx.hbs",
      },
      // Services
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/index.ts",
        templateFile: "templates/app/src/services/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/user.service.ts",
        templateFile: "templates/app/src/services/user.service.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/auth.service.ts",
        templateFile: "templates/app/src/services/auth.service.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/types/index.ts",
        templateFile: "templates/app/src/services/types/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/types/common.ts",
        templateFile: "templates/app/src/services/types/common.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/types/user.ts",
        templateFile: "templates/app/src/services/types/user.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/types/auth.ts",
        templateFile: "templates/app/src/services/types/auth.ts.hbs",
      },
      // Stores
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/stores/index.ts",
        templateFile: "templates/app/src/stores/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/stores/auth.store.ts",
        templateFile: "templates/app/src/stores/auth.store.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/stores/ui.store.ts",
        templateFile: "templates/app/src/stores/ui.store.ts.hbs",
      },
      // Hooks
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/hooks/index.ts",
        templateFile: "templates/app/src/hooks/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/hooks/use-media-query.ts",
        templateFile: "templates/app/src/hooks/use-media-query.ts.hbs",
      },
      // Public assets
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/public/.gitkeep",
        template: "",
      },
      // Gitignore
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/.gitignore",
        templateFile: "templates/app/.gitignore.hbs",
      },
    ],
  });
};
