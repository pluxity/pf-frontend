import type { Meta, StoryObj } from "@storybook/react";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from "./Modal";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Label } from "../../atoms/Label";

const meta: Meta<typeof Modal> = {
  title: "Organisms/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open Modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirm Action</ModalTitle>
          <ModalDescription>
            Are you sure you want to proceed with this action? This cannot be undone.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Cancel</Button>
          </ModalClose>
          <Button>Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Edit Profile</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Profile</ModalTitle>
          <ModalDescription>
            Make changes to your profile here. Click save when you're done.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Cancel</Button>
          </ModalClose>
          <Button>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="error">Delete Account</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Delete Account</ModalTitle>
          <ModalDescription>
            Are you sure you want to delete your account? This action is permanent and cannot be
            undone.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Cancel</Button>
          </ModalClose>
          <Button variant="error">Delete</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Terms & Conditions</Button>
      </ModalTrigger>
      <ModalContent className="max-h-[80vh] overflow-hidden">
        <ModalHeader>
          <ModalTitle>Terms & Conditions</ModalTitle>
          <ModalDescription>Please read and accept our terms and conditions.</ModalDescription>
        </ModalHeader>
        <ModalBody className="max-h-[400px] overflow-y-auto">
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Decline</Button>
          </ModalClose>
          <Button>Accept</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};
