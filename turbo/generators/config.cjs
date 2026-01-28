const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/** @type {import('@turbo/gen').PlopTypes.NodePlopAPI} */
module.exports = function generator(plop) {
  // Get the root path (turbo/generators -> root)
  const rootPath = path.resolve(__dirname, "../..");

  // Custom action to copy binary files
  plop.setActionType("copyFile", function (answers, config) {
    const srcPath = path.resolve(__dirname, config.src);
    const destPath = path.join(rootPath, "apps", answers.name, config.destPath);

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcPath, destPath);
    return `Copied ${config.src} to ${destPath}`;
  });

  plop.setGenerator("app", {
    description: "Create a new React application",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the new app?",
        validate: function (input) {
          if (!input) return "App name is required";
          if (!/^[a-z0-9-]+$/.test(input)) return "App name must be lowercase with hyphens only";
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
      {
        type: "confirm",
        name: "includeCctv",
        message: "Include @pf-dev/cctv?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeMap",
        message: "Include @pf-dev/map? (includes Cesium)",
        default: false,
      },
      {
        type: "confirm",
        name: "includeThree",
        message: "Include @pf-dev/three?",
        default: false,
      },
      {
        type: "confirm",
        name: "useAuth",
        message: "Use authentication? (includes login page and auth setup)",
        default: false,
      },
      {
        type: "confirm",
        name: "useProtectedRouter",
        message: "Use ProtectedRouter? (requires authentication)",
        default: false,
        when: (answers) => answers.useAuth,
      },
      {
        type: "confirm",
        name: "useSpaStructure",
        message: "Use SPA structure? (single dashboard page with views/)",
        default: true,
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
      // Pages (multi-page structure or login page)
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/index.ts",
        templateFile: "templates/app/src/pages/index.ts.hbs",
        skip: function (answers) {
          // pages/index.ts is needed for:
          // 1. Multi-page structure (not SPA)
          // 2. SPA with auth (needs to export LoginPage)
          if (answers.useSpaStructure && !answers.useAuth) {
            return "Skipping pages/index.ts (SPA without auth)";
          }
          return false;
        },
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/home/index.tsx",
        templateFile: "templates/app/src/pages/home/index.tsx.hbs",
        skip: function (answers) {
          if (answers.useSpaStructure) {
            return "Skipping pages/home (using views/HomePage)";
          }
          return false;
        },
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/login/index.tsx",
        templateFile: "templates/app/src/pages/login/index.tsx.hbs",
        skip: function (answers) {
          if (!answers.useAuth) {
            return "Skipping login page (authentication not enabled)";
          }
          return false;
        },
      },
      // Views (SPA structure)
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/views/index.ts",
        templateFile: "templates/app/src/views/index.ts.hbs",
        skip: function (answers) {
          if (!answers.useSpaStructure) {
            return "Skipping views/ (using pages/ structure)";
          }
          return false;
        },
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/views/HomePage.tsx",
        templateFile: "templates/app/src/views/HomePage.tsx.hbs",
        skip: function (answers) {
          if (!answers.useSpaStructure) {
            return "Skipping views/HomePage (using pages/home)";
          }
          return false;
        },
      },
      // Services
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/index.ts",
        templateFile: "templates/app/src/services/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/client.ts",
        templateFile: "templates/app/src/services/client.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/user.service.ts",
        templateFile: "templates/app/src/services/user.service.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/types/index.ts",
        templateFile: "templates/app/src/services/types/index.ts.hbs",
      },
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/services/types/user.ts",
        templateFile: "templates/app/src/services/types/user.ts.hbs",
      },
      // Hooks
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/src/hooks/index.ts",
        templateFile: "templates/app/src/hooks/index.ts.hbs",
      },
      // Public assets
      {
        type: "copyFile",
        src: "templates/app/public/favicon.ico",
        destPath: "public/favicon.ico",
      },
      // Cesium post-build script (only when includeMap is true)
      {
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/scripts/post-build.js",
        templateFile: "templates/app/scripts/post-build.js.hbs",
        skip: function (answers) {
          if (!answers.includeMap) {
            return "Skipping post-build.js (Map not included)";
          }
          return false;
        },
      },
      // Format generated files with prettier
      function (answers) {
        const appPath = path.join(rootPath, "apps", answers.name);
        // Windows 경로 구분자(\)를 POSIX 스타일(/)로 정규화하여 glob 패턴 문제를 방지합니다.
        const normalizedAppPath = appPath.replace(/\\/g, "/");
        try {
          console.log(`\nFormatting generated files with prettier...`);
          execSync(`pnpm prettier --write "${normalizedAppPath}/**/*"`, {
            cwd: rootPath,
            stdio: "inherit",
          });
          return `✓ Formatted all files in apps/${answers.name}`;
        } catch (error) {
          console.error("Warning: Failed to format files with prettier");
          return "⚠ Prettier formatting failed, you may need to run 'pnpm lint --fix' manually";
        }
      },
    ],
  });

  plop.setGenerator("admin", {
    description: "Create a new Admin application with authentication and user management",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the new admin app?",
        validate: function (input) {
          if (!input) return "App name is required";
          if (!/^[a-z0-9-]+$/.test(input)) return "App name must be lowercase with hyphens only";
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Brief description of the admin app:",
        default: "A new Admin application",
      },
      {
        type: "input",
        name: "port",
        message: "Development server port:",
        default: "3001",
        validate: function (input) {
          const port = parseInt(input, 10);
          if (isNaN(port) || port < 1000 || port > 65535)
            return "Port must be a number between 1000 and 65535";
          return true;
        },
      },
      {
        type: "confirm",
        name: "includeDashboard",
        message: "Include Dashboard page?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeCrudCard",
        message: "Include CRUD Card example?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeCrudList",
        message: "Include CRUD List example?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeMap",
        message: "Include @pf-dev/map? (includes Cesium)",
        default: false,
      },
      {
        type: "confirm",
        name: "includeThree",
        message: "Include @pf-dev/three?",
        default: false,
      },
    ],
    actions: function (data) {
      const actions = [
        // Package files
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/package.json",
          templateFile: "templates/admin/package.json.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/tsconfig.json",
          templateFile: "templates/admin/tsconfig.json.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/vite.config.ts",
          templateFile: "templates/admin/vite.config.ts.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/index.html",
          templateFile: "templates/admin/index.html.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/eslint.config.js",
          templateFile: "templates/admin/eslint.config.js.hbs",
        },
        // Environment files
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.development",
          templateFile: "templates/admin/env/.env.development.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.staging",
          templateFile: "templates/admin/env/.env.staging.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/.env.production",
          templateFile: "templates/admin/env/.env.production.hbs",
        },
        // Source files
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/main.tsx",
          templateFile: "templates/admin/src/main.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/App.tsx",
          templateFile: "templates/admin/src/App.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/vite-env.d.ts",
          templateFile: "templates/admin/src/vite-env.d.ts.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/styles/globals.css",
          templateFile: "templates/admin/src/styles/globals.css.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/hooks/index.ts",
          templateFile: "templates/admin/src/hooks/index.ts.hbs",
        },
        // Contexts
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/contexts/index.ts",
          templateFile: "templates/admin/src/contexts/index.ts.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/contexts/ToastContext.tsx",
          templateFile: "templates/admin/src/contexts/ToastContext.tsx.hbs",
        },
        // Layouts
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/layouts/index.ts",
          templateFile: "templates/admin/src/layouts/index.ts.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/layouts/RootLayout.tsx",
          templateFile: "templates/admin/src/layouts/RootLayout.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/layouts/AdminLayout.tsx",
          templateFile: "templates/admin/src/layouts/AdminLayout.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/layouts/AdminSidebar.tsx",
          templateFile: "templates/admin/src/layouts/AdminSidebar.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/layouts/Header.tsx",
          templateFile: "templates/admin/src/layouts/Header.tsx.hbs",
        },
        // Routes
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/routes/index.tsx",
          templateFile: "templates/admin/src/routes/index.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/routes/config.tsx",
          templateFile: "templates/admin/src/routes/config.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/routes/types.ts",
          templateFile: "templates/admin/src/routes/types.ts.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/routes/utils.ts",
          templateFile: "templates/admin/src/routes/utils.ts.hbs",
        },
        // Pages
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/index.ts",
          templateFile: "templates/admin/src/pages/index.ts.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/home/index.tsx",
          templateFile: "templates/admin/src/pages/home/index.tsx.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/apps/{{ name }}/src/pages/login/index.tsx",
          templateFile: "templates/admin/src/pages/login/index.tsx.hbs",
        },
        // Public assets
        {
          type: "copyFile",
          src: "templates/admin/public/favicon.ico",
          destPath: "public/favicon.ico",
        },
      ];

      // Add accounts pages (users, roles, permissions) - these are always included
      const accountsFiles = [
        "users/index.tsx.hbs",
        "users/types.ts",
        "users/components/index.ts",
        "users/components/UserTable.tsx",
        "users/components/UserFormModal.tsx",
        "users/components/UserDeleteDialog.tsx",
        "users/components/PasswordResetDialog.tsx",
        "users/hooks/index.ts",
        "users/hooks/useUsers.ts",
        "users/services/index.ts",
        "users/services/userService.ts",
        "roles/index.tsx.hbs",
        "roles/types.ts",
        "roles/components/index.ts",
        "roles/components/RoleTable.tsx",
        "roles/components/RoleFormModal.tsx",
        "roles/hooks/index.ts",
        "roles/hooks/useRoles.ts",
        "roles/services/index.ts",
        "roles/services/roleService.ts",
        "permissions/index.tsx.hbs",
        "permissions/types.ts",
        "permissions/components/index.ts",
        "permissions/components/PermissionTable.tsx",
        "permissions/components/PermissionFormModal.tsx",
        "permissions/components/PermissionDetailModal.tsx",
        "permissions/hooks/index.ts",
        "permissions/hooks/usePermissions.ts",
        "permissions/services/index.ts",
        "permissions/services/permissionService.ts",
      ];

      accountsFiles.forEach((file) => {
        // Remove .hbs extension from output path
        const outputPath = file.replace(/\.hbs$/, "");
        actions.push({
          type: "add",
          path: `{{ turbo.paths.root }}/apps/{{ name }}/src/pages/accounts/${outputPath}`,
          templateFile: `templates/admin/src/pages/accounts/${file}`,
        });
      });

      // Conditional: Dashboard
      if (data.includeDashboard) {
        const dashboardFiles = [
          "index.tsx",
          "components/index.ts",
          "components/DashboardGrid.tsx",
          "components/widgets/index.ts",
          "components/widgets/StatCard.tsx",
          "components/widgets/ChartWidget.tsx",
          "components/widgets/TableWidget.tsx",
          "components/widgets/EmptyWidget.tsx",
        ];

        dashboardFiles.forEach((file) => {
          actions.push({
            type: "add",
            path: `{{ turbo.paths.root }}/apps/{{ name }}/src/pages/dashboard/${file}`,
            templateFile: `templates/admin/src/pages/dashboard/${file}`,
          });
        });
      }

      // Conditional: CRUD Card Example
      if (data.includeCrudCard) {
        const crudCardFiles = [
          "index.tsx",
          "types.ts",
          "components/index.ts",
          "components/ItemCard.tsx",
          "components/ItemFormModal.tsx",
          "components/DeleteConfirmDialog.tsx",
          "hooks/index.ts",
          "hooks/useItems.ts",
          "services/index.ts",
          "services/itemService.ts",
        ];

        crudCardFiles.forEach((file) => {
          actions.push({
            type: "add",
            path: `{{ turbo.paths.root }}/apps/{{ name }}/src/pages/examples/crud-card/${file}`,
            templateFile: `templates/admin/src/pages/examples/crud-card/${file}`,
          });
        });
      }

      // Conditional: CRUD List Example
      if (data.includeCrudList) {
        const crudListFiles = [
          "index.tsx",
          "create.tsx",
          "detail.tsx",
          "types.ts",
          "components/index.ts",
          "components/UserColumns.tsx",
          "components/UserForm.tsx",
          "components/DeleteConfirmDialog.tsx",
          "hooks/index.ts",
          "hooks/useUsers.ts",
          "services/index.ts",
          "services/userService.ts",
        ];

        crudListFiles.forEach((file) => {
          actions.push({
            type: "add",
            path: `{{ turbo.paths.root }}/apps/{{ name }}/src/pages/examples/crud-list/${file}`,
            templateFile: `templates/admin/src/pages/examples/crud-list/${file}`,
          });
        });
      }

      // Cesium post-build script (only when includeMap is true)
      actions.push({
        type: "add",
        path: "{{ turbo.paths.root }}/apps/{{ name }}/scripts/post-build.js",
        templateFile: "templates/admin/scripts/post-build.js.hbs",
        skip: function (answers) {
          if (!answers.includeMap) {
            return "Skipping post-build.js (Map not included)";
          }
          return false;
        },
      });

      // Format generated files with prettier
      actions.push(function (answers) {
        const appPath = path.join(rootPath, "apps", answers.name);
        const normalizedAppPath = appPath.replace(/\\/g, "/");
        try {
          console.log(`\nFormatting generated files with prettier...`);
          execSync(`pnpm prettier --write "${normalizedAppPath}/**/*"`, {
            cwd: rootPath,
            stdio: "inherit",
          });
          return `✓ Formatted all files in apps/${answers.name}`;
        } catch (error) {
          console.error("Warning: Failed to format files with prettier");
          return "⚠ Prettier formatting failed, you may need to run 'pnpm lint --fix' manually";
        }
      });

      return actions;
    },
  });
};
