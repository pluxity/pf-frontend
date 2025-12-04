import type { Meta, StoryObj } from "@storybook/react";
import { PasswordChangeCard } from "./PasswordChangeCard";

const meta: Meta<typeof PasswordChangeCard> = {
  title: "Organisms/PasswordChangeCard",
  component: PasswordChangeCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PasswordChangeCard>;

export const Default: Story = {
  args: {
    onSubmit: (newPassword, confirmPassword) => {
      console.log("Password change:", { newPassword, confirmPassword });
    },
  },
};

export const WithError: Story = {
  name: "에러 상태",
  args: {
    error: "비밀번호가 일치하지 않습니다.",
    onSubmit: (newPassword, confirmPassword) => {
      console.log("Password change:", { newPassword, confirmPassword });
    },
  },
};

export const Loading: Story = {
  name: "로딩 상태",
  args: {
    isLoading: true,
  },
};

export const CustomLabels: Story = {
  name: "커스텀 라벨",
  args: {
    title: "Change Password",
    subtitle: "Please enter your new password.",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "Enter at least 8 characters",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    submitButtonText: "Update Password",
  },
};
