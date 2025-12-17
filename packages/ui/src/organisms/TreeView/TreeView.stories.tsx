import type { StoryObj } from "@storybook/react";
import { useState, useMemo } from "react";
import { TreeView, TreeNode } from "./TreeView";
import { FileText, Image, Music, Video, Code } from "../../atoms/Icon";
import { Badge } from "../../atoms/Badge";

const StatusDot = ({ status }: { status: "active" | "warning" | "error" }) => {
  const colors = {
    active: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />;
};

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 font-medium">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const meta = {
  title: "Organisms/TreeView",
  component: TreeView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showIcons: {
      control: "boolean",
      description: "아이콘 표시 여부",
    },
    defaultIcon: {
      control: "select",
      options: ["folder", "file", "none"],
      description: "기본 아이콘 타입",
    },
    indentSize: {
      control: "number",
      description: "들여쓰기 크기 (px)",
    },
    showCheckbox: {
      control: "boolean",
      description: "체크박스 표시 여부",
    },
    height: {
      control: "number",
      description: "컨테이너 고정 높이 (px)",
    },
  },
};

export default meta;
type Story = StoryObj;

const sampleData: TreeNode[] = [
  {
    id: "1",
    label: "Documents",
    children: [
      {
        id: "1-1",
        label: "Work",
        children: [
          { id: "1-1-1", label: "Reports" },
          { id: "1-1-2", label: "Presentations" },
        ],
      },
      {
        id: "1-2",
        label: "Personal",
        children: [
          { id: "1-2-1", label: "Photos" },
          { id: "1-2-2", label: "Music" },
        ],
      },
    ],
  },
  {
    id: "2",
    label: "Downloads",
    children: [
      { id: "2-1", label: "Software" },
      { id: "2-2", label: "Games" },
    ],
  },
  {
    id: "3",
    label: "Projects",
  },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithDefaultExpanded: Story = {
  args: {
    data: sampleData,
    defaultExpandedIds: ["1", "1-1"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithSelection: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | undefined>();

    return (
      <div style={{ width: 300 }}>
        <TreeView
          data={sampleData}
          defaultExpandedIds={["1"]}
          selectedId={selectedId}
          onNodeSelect={(node) => setSelectedId(node.id)}
        />
        {selectedId && <p className="mt-4 text-sm text-gray-500">Selected: {selectedId}</p>}
      </div>
    );
  },
};

export const WithCustomIcons: Story = {
  args: {
    data: [
      {
        id: "1",
        label: "Project",
        children: [
          {
            id: "1-1",
            label: "index.tsx",
            icon: <Code size="sm" className="text-blue-500" />,
          },
          {
            id: "1-2",
            label: "styles.css",
            icon: <FileText size="sm" className="text-purple-500" />,
          },
          {
            id: "1-3",
            label: "Assets",
            children: [
              {
                id: "1-3-1",
                label: "logo.png",
                icon: <Image size="sm" className="text-green-500" />,
              },
              {
                id: "1-3-2",
                label: "background.mp4",
                icon: <Video size="sm" className="text-red-500" />,
              },
              {
                id: "1-3-3",
                label: "notification.mp3",
                icon: <Music size="sm" className="text-orange-500" />,
              },
            ],
          },
        ],
      },
    ],
    defaultExpandedIds: ["1", "1-3"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithoutIcons: Story = {
  args: {
    data: sampleData,
    showIcons: false,
    defaultExpandedIds: ["1"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const FileExplorer: Story = {
  render: () => {
    const fileData: TreeNode[] = [
      {
        id: "src",
        label: "src",
        children: [
          {
            id: "components",
            label: "components",
            children: [
              { id: "Button.tsx", label: "Button.tsx" },
              { id: "Input.tsx", label: "Input.tsx" },
              { id: "Modal.tsx", label: "Modal.tsx" },
            ],
          },
          {
            id: "hooks",
            label: "hooks",
            children: [
              { id: "useAuth.ts", label: "useAuth.ts" },
              { id: "useTheme.ts", label: "useTheme.ts" },
            ],
          },
          { id: "App.tsx", label: "App.tsx" },
          { id: "index.tsx", label: "index.tsx" },
        ],
      },
      {
        id: "public",
        label: "public",
        children: [
          { id: "favicon.ico", label: "favicon.ico" },
          { id: "index.html", label: "index.html" },
        ],
      },
      { id: "package.json", label: "package.json" },
      { id: "tsconfig.json", label: "tsconfig.json" },
    ];

    const [selectedId, setSelectedId] = useState<string | undefined>();

    return (
      <div className="w-[300px] rounded-lg border border-gray-200 bg-white p-2">
        <div className="mb-2 border-b border-gray-100 pb-2">
          <span className="text-xs font-medium text-gray-500">EXPLORER</span>
        </div>
        <TreeView
          data={fileData}
          defaultExpandedIds={["src", "components"]}
          selectedId={selectedId}
          onNodeSelect={(node) => setSelectedId(node.id)}
          defaultIcon="file"
        />
      </div>
    );
  },
};

export const DisabledNodes: Story = {
  args: {
    data: [
      {
        id: "1",
        label: "Available",
        children: [
          { id: "1-1", label: "Item 1" },
          { id: "1-2", label: "Item 2" },
        ],
      },
      {
        id: "2",
        label: "Disabled Folder",
        disabled: true,
        children: [{ id: "2-1", label: "Can't access" }],
      },
      {
        id: "3",
        label: "Another Available",
      },
    ],
    defaultExpandedIds: ["1"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithCheckbox: Story = {
  render: () => {
    const [checkedIds, setCheckedIds] = useState<string[]>([]);

    return (
      <div style={{ width: 300 }}>
        <TreeView
          data={sampleData}
          defaultExpandedIds={["1", "1-1", "2"]}
          showCheckbox
          checkedIds={checkedIds}
          onCheckedChange={setCheckedIds}
        />
        <div className="mt-4 text-sm text-gray-500">
          <p>체크된 항목: {checkedIds.length}개</p>
          {checkedIds.length > 0 && <p className="mt-1 text-xs">{checkedIds.join(", ")}</p>}
        </div>
      </div>
    );
  },
};

export const CheckboxWithDefaultChecked: Story = {
  args: {
    data: sampleData,
    defaultExpandedIds: ["1", "1-1"],
    showCheckbox: true,
    defaultCheckedIds: ["1-1-1", "1-1-2"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const FixedHeightWithCheckbox: Story = {
  render: () => {
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const largeData: TreeNode[] = [
      {
        id: "folder-1",
        label: "프로젝트 A",
        children: [
          { id: "file-1-1", label: "index.ts" },
          { id: "file-1-2", label: "utils.ts" },
          { id: "file-1-3", label: "types.ts" },
        ],
      },
      {
        id: "folder-2",
        label: "프로젝트 B",
        children: [
          { id: "file-2-1", label: "main.ts" },
          { id: "file-2-2", label: "config.ts" },
        ],
      },
      {
        id: "folder-3",
        label: "프로젝트 C",
        children: [
          { id: "file-3-1", label: "app.ts" },
          { id: "file-3-2", label: "router.ts" },
          { id: "file-3-3", label: "store.ts" },
        ],
      },
      {
        id: "folder-4",
        label: "공통 모듈",
        children: [
          { id: "file-4-1", label: "helpers.ts" },
          { id: "file-4-2", label: "constants.ts" },
        ],
      },
    ];

    return (
      <div style={{ width: 320 }}>
        <TreeView
          data={largeData}
          height={250}
          defaultExpandedIds={["folder-1", "folder-2", "folder-3", "folder-4"]}
          showCheckbox
          checkedIds={checkedIds}
          onCheckedChange={setCheckedIds}
          selectedId={selectedId}
          onNodeSelect={(node) => setSelectedId(node.id)}
        />
        <div className="mt-4 space-y-1 text-sm text-gray-500">
          <p>선택: {selectedId || "없음"}</p>
          <p>체크: {checkedIds.length}개</p>
        </div>
      </div>
    );
  },
};

export const WithRenderProp: Story = {
  args: {
    data: [
      {
        id: "1",
        label: "Documents",
        render: (
          <div className="flex items-center justify-between w-full">
            <span>Documents</span>
            <Badge variant="secondary" size="sm">
              23
            </Badge>
          </div>
        ),
        children: [
          {
            id: "1-1",
            label: "Work",
            render: (
              <div className="flex items-center gap-2">
                <span>Work</span>
                <Badge variant="primary" size="sm">
                  New
                </Badge>
              </div>
            ),
            children: [{ id: "1-1-1", label: "Reports" }],
          },
          {
            id: "1-2",
            label: "Personal",
            render: (
              <div className="flex items-center gap-2">
                <span>Personal</span>
                <span className="text-xs text-gray-400">(5 items)</span>
              </div>
            ),
          },
        ],
      },
      {
        id: "2",
        label: "Downloads",
        render: (
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold">Downloads</span>
            <Badge variant="success" size="sm">
              Active
            </Badge>
          </div>
        ),
      },
    ],
    defaultExpandedIds: ["1"],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 350 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithBadgesAndStatus: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const dataWithStatus: TreeNode[] = [
      {
        id: "servers",
        label: "Servers",
        render: (
          <div className="flex items-center gap-2">
            <span>Servers</span>
            <Badge variant="secondary" size="sm">
              3
            </Badge>
          </div>
        ),
        children: [
          {
            id: "server-1",
            label: "Production Server",
            render: (
              <div className="flex items-center gap-2">
                <StatusDot status="active" />
                <span>Production Server</span>
              </div>
            ),
          },
          {
            id: "server-2",
            label: "Staging Server",
            render: (
              <div className="flex items-center gap-2">
                <StatusDot status="warning" />
                <span>Staging Server</span>
              </div>
            ),
          },
          {
            id: "server-3",
            label: "Development Server",
            render: (
              <div className="flex items-center gap-2">
                <StatusDot status="error" />
                <span>Development Server</span>
              </div>
            ),
          },
        ],
      },
      {
        id: "tasks",
        label: "Tasks",
        render: (
          <div className="flex items-center justify-between w-full">
            <span>Tasks</span>
            <Badge variant="warning" size="sm">
              5 pending
            </Badge>
          </div>
        ),
      },
    ];

    return (
      <div style={{ width: 350 }}>
        <TreeView
          data={dataWithStatus}
          defaultExpandedIds={["servers"]}
          selectedId={selectedId}
          onNodeSelect={(node) => setSelectedId(node.id)}
        />
      </div>
    );
  },
};

export const WithSearchHighlight: Story = {
  render: () => {
    const [searchQuery, setSearchQuery] = useState("doc");

    const searchData: TreeNode[] = useMemo(
      () => [
        {
          id: "1",
          label: "documents",
          render: highlightText("documents", searchQuery),
          children: [
            {
              id: "1-1",
              label: "work documents",
              render: highlightText("work documents", searchQuery),
            },
            {
              id: "1-2",
              label: "personal notes",
              render: highlightText("personal notes", searchQuery),
            },
          ],
        },
        {
          id: "2",
          label: "downloads",
          render: highlightText("downloads", searchQuery),
        },
        {
          id: "3",
          label: "projects",
          render: highlightText("projects", searchQuery),
          children: [
            {
              id: "3-1",
              label: "documentation site",
              render: highlightText("documentation site", searchQuery),
            },
          ],
        },
      ],
      [searchQuery]
    );

    return (
      <div style={{ width: 350 }}>
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색..."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <TreeView data={searchData} defaultExpandedIds={["1", "3"]} />
      </div>
    );
  },
};
