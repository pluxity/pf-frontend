import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetSection,
  SheetClose,
} from "./Sheet";
import { Button } from "../../atoms/Button";
import { Switch } from "../../atoms/Switch";
import { Input } from "../../atoms/Input";
import { Label } from "../../atoms/Label";

const meta: Meta<typeof Sheet> = {
  title: "Organisms/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your preferences
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <SheetSection title="Notifications">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS notifications</span>
                <Switch />
              </div>
            </div>
          </SheetSection>
          <SheetSection title="Privacy">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile visibility</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show online status</span>
                <Switch defaultChecked />
              </div>
            </div>
          </SheetSection>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost">Cancel</Button>
          </SheetClose>
          <Button>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Browse through the menu
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="space-y-2 pt-4">
            <Button variant="ghost" className="w-full justify-start">Home</Button>
            <Button variant="ghost" className="w-full justify-start">Products</Button>
            <Button variant="ghost" className="w-full justify-start">About</Button>
            <Button variant="ghost" className="w-full justify-start">Contact</Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Add New User</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add User</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new user
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Developer" />
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost">Cancel</Button>
          </SheetClose>
          <Button>Create User</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[300px]">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Select an action to perform
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <Button variant="outline" className="flex-col h-20">
              <span>Share</span>
            </Button>
            <Button variant="outline" className="flex-col h-20">
              <span>Copy</span>
            </Button>
            <Button variant="outline" className="flex-col h-20">
              <span>Edit</span>
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};
