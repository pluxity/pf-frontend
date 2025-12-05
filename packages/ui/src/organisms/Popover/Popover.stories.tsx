import type { Meta, StoryObj } from "@storybook/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "./Popover";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";

const meta = {
  title: "Organisms/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">This is a simple popover content.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Popover Title</PopoverTitle>
          <PopoverDescription>This is a description for the popover.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-4">
          <p className="text-sm">Additional content goes here.</p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Edit Profile</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Edit Profile</PopoverTitle>
          <PopoverDescription>Make changes to your profile here.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="Enter your email" />
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button variant="outline">Cancel</Button>
            </PopoverClose>
            <Button>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Top</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm">Popover on top</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Right</Button>
        </PopoverTrigger>
        <PopoverContent side="right">
          <p className="text-sm">Popover on right</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm">Popover on bottom</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Left</Button>
        </PopoverTrigger>
        <PopoverContent side="left">
          <p className="text-sm">Popover on left</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const WithCloseButton: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Notification</PopoverTitle>
        </PopoverHeader>
        <p className="mt-2 text-sm">You have 3 new messages in your inbox.</p>
        <div className="mt-4">
          <PopoverClose asChild>
            <Button className="w-full">Got it</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
