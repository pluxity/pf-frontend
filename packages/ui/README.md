# @pf-dev/ui

A modern React component library built with TypeScript, Tailwind CSS, and Radix UI primitives. Features composition pattern for flexible, accessible UI components.

## Installation

```bash
pnpm add @pf-dev/ui
```

### Peer Dependencies

Ensure you have the following dependencies installed:

```bash
pnpm add react react-dom tailwindcss class-variance-authority clsx tailwind-merge
```

### Tailwind CSS Configuration

Add the ui package to your Tailwind config:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@pf-dev/ui/src/**/*.{js,ts,jsx,tsx}", // Add this line
  ],
  theme: {
    extend: {
      colors: {
        brand: "#4D7EFF",
        "success-brand": "#00C48C",
        "warning-brand": "#FFA26B",
        "error-brand": "#DE4545",
      },
    },
  },
};
```

## Components

### Atoms

Basic building blocks for your UI:

- **Avatar** - User profile images with fallback support
- **Badge** - Status indicators and labels
- **Button** - Interactive buttons with variants
- **Icon** - SVG icon components (Lucide React)
- **Input** - Form input fields
- **Label** - Form labels
- **Select** - Dropdown selection
- **Slider** - Range input
- **Switch** - Toggle switch
- **Tabs** - Tab navigation
- **Textarea** - Multi-line text input

### Organisms

Complex components built with composition pattern:

- **Sidebar** - Collapsible navigation sidebar
- **NavigationBar** - Top navigation bar
- **FloatingMenu** - Expandable floating menu
- **Footer** - Page footer with links
- **Timeline** - Vertical timeline
- **Stepper** - Step-by-step progress indicator
- **NotificationCenter** - Notification panel

## Usage

### Composition Pattern

All organism components use the composition pattern, allowing you to build flexible UIs by composing sub-components.

#### Sidebar

```tsx
import { Sidebar } from "@pf-dev/ui";
import { Home, Users, Settings } from "@pf-dev/ui/atoms/Icon";

function App() {
  return (
    <Sidebar>
      <Sidebar.Header title="Dashboard">
        <Sidebar.CollapseButton iconOnly />
      </Sidebar.Header>

      <Sidebar.Section label="General">
        <Sidebar.Item icon={<Home size="sm" />} active>
          Home
        </Sidebar.Item>
        <Sidebar.Item icon={<Users size="sm" />}>Users</Sidebar.Item>
      </Sidebar.Section>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  );
}
```

**Features:**

- `Sidebar.Header` - Header with logo, title, and optional children (e.g., collapse button)
- `Sidebar.Footer` - Footer area for collapse button or user profile
- `Sidebar.Section` - Grouped navigation items with labels
- `Sidebar.Item` - Individual navigation item with icon support
- `Sidebar.CollapseButton` - Toggle button (text in footer, icon in header)
- `Sidebar.Separator` - Visual separator
- `Sidebar.Custom` - Custom content

**Props:**

- `defaultCollapsed?: boolean` - Initial collapsed state
- `collapsed?: boolean` - Controlled collapsed state
- `onCollapsedChange?: (collapsed: boolean) => void` - Callback on state change
- `ariaLabelCollapse?: string` - Accessibility label for collapse action
- `ariaLabelExpand?: string` - Accessibility label for expand action

#### NavigationBar

```tsx
import { NavigationBar } from "@pf-dev/ui";
import { Button } from "@pf-dev/ui/atoms/Button";

function App() {
  return (
    <NavigationBar
      logo={<img src="/logo.svg" alt="Logo" />}
      actions={
        <>
          <Button variant="ghost">Sign In</Button>
          <Button>Sign Up</Button>
        </>
      }
    >
      <NavigationBar.Item href="/" active>
        Home
      </NavigationBar.Item>
      <NavigationBar.Item href="/about">About</NavigationBar.Item>
      <NavigationBar.Item href="/contact">Contact</NavigationBar.Item>
    </NavigationBar>
  );
}
```

**Features:**

- `NavigationBar.Item` - Navigation link
- `NavigationBar.Logo` - Custom logo wrapper
- `NavigationBar.Actions` - Action buttons wrapper

**Props:**

- `logo?: React.ReactNode` - Custom logo element
- `logoText?: string` - Default logo text (if logo not provided)
- `actions?: React.ReactNode` - Action buttons

#### FloatingMenu

```tsx
import { FloatingMenu } from "@pf-dev/ui";
import { Home, Settings } from "@pf-dev/ui/atoms/Icon";

function App() {
  return (
    <FloatingMenu logo="PLUXITY" defaultExpanded>
      <FloatingMenu.Group label="Main">
        <FloatingMenu.Item icon={<Home size="sm" />} active>
          Dashboard
        </FloatingMenu.Item>
      </FloatingMenu.Group>

      <FloatingMenu.Separator />

      <FloatingMenu.Group label="Settings">
        <FloatingMenu.Item icon={<Settings size="sm" />}>Settings</FloatingMenu.Item>
      </FloatingMenu.Group>
    </FloatingMenu>
  );
}
```

**Features:**

- `FloatingMenu.Item` - Menu item
- `FloatingMenu.Group` - Grouped items with label
- `FloatingMenu.Separator` - Visual separator
- `FloatingMenu.Custom` - Custom content

**Props:**

- `logo?: React.ReactNode` - Logo element
- `compact?: boolean` - Compact mode (smaller width)
- `defaultExpanded?: boolean` - Initial expanded state
- `expanded?: boolean` - Controlled expanded state
- `onExpandedChange?: (expanded: boolean) => void` - Callback on state change
- `ariaLabelCollapse?: string` - Accessibility label
- `ariaLabelExpand?: string` - Accessibility label

#### Footer

```tsx
import { Footer } from "@pf-dev/ui";

function App() {
  return (
    <Footer>
      <Footer.Brand logoText="PLUXITY" tagline="Building the future of web development">
        <Footer.SocialLinks>
          <Footer.SocialLink platform="github" href="https://github.com/..." />
          <Footer.SocialLink platform="twitter" href="https://twitter.com/..." />
        </Footer.SocialLinks>
      </Footer.Brand>

      <Footer.Column title="Product">
        <Footer.Link href="/features">Features</Footer.Link>
        <Footer.Link href="/pricing">Pricing</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Company">
        <Footer.Link href="/about">About</Footer.Link>
        <Footer.Link href="/contact">Contact</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 PLUXITY. All rights reserved.</Footer.Copyright>
    </Footer>
  );
}
```

**Features:**

- `Footer.Brand` - Brand area with logo and tagline
- `Footer.Column` - Link column with title
- `Footer.Link` - Individual link
- `Footer.SocialLinks` - Social links wrapper
- `Footer.SocialLink` - Social media link (supports: github, twitter, linkedin, youtube, facebook, instagram)
- `Footer.Copyright` - Copyright notice
- `Footer.Custom` - Custom content

#### Timeline

```tsx
import { Timeline } from "@pf-dev/ui";
import { Check } from "@pf-dev/ui/atoms/Icon";

function App() {
  return (
    <Timeline>
      <Timeline.Item
        title="Project Created"
        description="Initial project setup completed"
        time="2 hours ago"
        variant="success"
      />
      <Timeline.Item
        title="First Commit"
        description="Added base components"
        time="1 hour ago"
        icon={<Check size="sm" />}
      />
      <Timeline.Item title="In Progress" description="Working on features" time="Just now" />
    </Timeline>
  );
}
```

**Features:**

- `Timeline.Item` - Timeline item with icon, title, description, time
- `Timeline.Custom` - Custom content

**Props:**

- `variant?: "default" | "success" | "warning" | "error"` - Color variant
- `icon?: React.ReactNode` - Custom icon

#### Stepper

```tsx
import { Stepper } from "@pf-dev/ui";

function App() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Stepper currentStep={currentStep} orientation="horizontal">
      <Stepper.Step title="Account" description="Create your account" />
      <Stepper.Step title="Profile" description="Complete your profile" />
      <Stepper.Step title="Complete" description="All done!" />
    </Stepper>
  );
}
```

**Features:**

- `Stepper.Step` - Individual step
- `Stepper.Custom` - Custom content

**Props:**

- `currentStep: number` - Current step index (0-based)
- `orientation?: "horizontal" | "vertical"` - Layout orientation

#### NotificationCenter

```tsx
import { NotificationCenter } from "@pf-dev/ui";
import { Bell } from "@pf-dev/ui/atoms/Icon";

function App() {
  const [unreadCount, setUnreadCount] = useState(3);

  return (
    <NotificationCenter onNotificationClick={(id) => console.log("Clicked:", id)} maxHeight={400}>
      <NotificationCenter.Header>
        <NotificationCenter.UnreadBadge count={unreadCount} />
        <NotificationCenter.MarkAllRead onClick={() => setUnreadCount(0)} />
      </NotificationCenter.Header>

      <NotificationCenter.Item
        id="1"
        icon={<Bell size="sm" />}
        title="New message"
        description="You have a new message from John"
        timestamp="5 min ago"
        read={false}
      />
      <NotificationCenter.Item
        id="2"
        title="Update available"
        description="A new version is available"
        timestamp="1 hour ago"
        read={true}
      />

      <NotificationCenter.Empty>No new notifications</NotificationCenter.Empty>
    </NotificationCenter>
  );
}
```

**Features:**

- `NotificationCenter.Header` - Header with title
- `NotificationCenter.UnreadBadge` - Unread count badge
- `NotificationCenter.MarkAllRead` - Mark all as read button
- `NotificationCenter.Item` - Individual notification
- `NotificationCenter.Empty` - Empty state message
- `NotificationCenter.Custom` - Custom content

**Props:**

- `onNotificationClick?: (id: string) => void` - Click handler
- `maxHeight?: number | string` - Maximum height

## Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader support

### Internationalization

Components with interactive elements support custom aria-labels:

```tsx
<Sidebar
  ariaLabelCollapse="사이드바 접기"
  ariaLabelExpand="사이드바 펼치기"
>
  {/* ... */}
</Sidebar>

<FloatingMenu
  ariaLabelCollapse="메뉴 접기"
  ariaLabelExpand="메뉴 펼치기"
>
  {/* ... */}
</FloatingMenu>
```

## TypeScript

All components are fully typed with TypeScript. Import types as needed:

```tsx
import type { SidebarProps, SidebarHeaderProps, SidebarItemProps } from "@pf-dev/ui";
```

## Storybook

View all components in Storybook:

```bash
pnpm run storybook
```

## Contributing

This is a monorepo package. To contribute:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run storybook: `pnpm run storybook`
4. Make your changes
5. Run type-check: `pnpm run type-check`
6. Run lint: `pnpm run lint`

## License

MIT
