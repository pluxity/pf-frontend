import type { Meta, StoryObj } from "@storybook/react";
import { LoginCard } from "./LoginCard";

const meta = {
  title: "Organisms/LoginCard",
  component: LoginCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "제목",
    },
    subtitle: {
      control: "text",
      description: "부제목",
    },
    loading: {
      control: "boolean",
      description: "로딩 상태",
    },
  },
} satisfies Meta<typeof LoginCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Welcome back",
    subtitle: "Sign in to your account",
    onLoginSubmit: (data) => {
      console.log("Login data:", data);
      alert(`Username: ${data.username}\nRemember: ${data.remember}`);
    },
  },
};

export const WithLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-lg bg-brand" />
        <span className="text-2xl font-bold text-brand">Brand</span>
      </div>
    ),
    title: "Sign in",
    subtitle: "Enter your credentials to continue",
  },
};

export const CustomTitle: Story = {
  args: {
    title: "Login to Dashboard",
    subtitle: "Access your analytics and reports",
  },
};

export const Loading: Story = {
  args: {
    title: "Welcome back",
    subtitle: "Sign in to your account",
    loading: true,
  },
};

export const WithCustomLinks: Story = {
  args: {
    title: "Welcome back",
    subtitle: "Sign in to your account",
    forgotPasswordHref: "/forgot-password",
    signUpHref: "/register",
  },
};

export const FullExample: Story = {
  render: () => (
    <div className="min-h-[600px] bg-gray-100 flex items-center justify-center p-8">
      <LoginCard
        logo={
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
          </div>
        }
        title="Welcome to App"
        subtitle="Sign in to access your workspace"
        onLoginSubmit={(data) => {
          console.log("Login submitted:", data);
        }}
        forgotPasswordHref="/forgot"
        signUpHref="/signup"
      />
    </div>
  ),
};

export const customExample: Story = {
  render: () => (
    <LoginCard
      title="안녕하세요"
      subtitle="계정에 로그인하세요."
      usernameLabel="아이디"
      passwordLabel="비밀번호"
      usernamePlaceholder="아이디를 입력하세요"
      rememberMeLabel="로그인 유지"
      forgotPasswordHref={undefined}
      signUpHref={undefined}
      submitLabel="로그인"
      loadingLabel="로그인 중..."
    />
  ),
};
