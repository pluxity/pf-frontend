import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Molecules/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const PaginationDemo = () => {
  const [currentPage, setCurrentPage] = useState(1);
  return <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />;
};

export const Default: Story = {
  render: () => <PaginationDemo />,
};

export const ManyPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(5);
    return <Pagination currentPage={currentPage} totalPages={20} onPageChange={setCurrentPage} />;
  },
};

export const FewPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    return <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />;
  },
};

export const Minimal: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
        variant="minimal"
      />
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [page1, setPage1] = useState(3);
    const [page2, setPage2] = useState(3);
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm text-gray-500 mb-2">Default Style</p>
          <Pagination
            currentPage={page1}
            totalPages={10}
            onPageChange={setPage1}
            variant="default"
          />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Minimal Style</p>
          <Pagination
            currentPage={page2}
            totalPages={10}
            onPageChange={setPage2}
            variant="minimal"
          />
        </div>
      </div>
    );
  },
};
