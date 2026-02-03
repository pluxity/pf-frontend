import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";

const meta = {
  title: "Organisms/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Composition Pattern Examples
// ============================================================================

export const Default: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Company" tagline="Building great products" />

      <Footer.Column title="Product">
        <Footer.Link href="#">Features</Footer.Link>
        <Footer.Link href="#">Pricing</Footer.Link>
        <Footer.Link href="#">Documentation</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Company">
        <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Blog</Footer.Link>
        <Footer.Link href="#">Careers</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Support">
        <Footer.Link href="#">Help Center</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link>
        <Footer.Link href="#">Status</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 Company, Inc. All rights reserved.</Footer.Copyright>
    </Footer>
  ),
};

export const WithSocialLinks: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Brand" tagline="Connecting people worldwide">
        <Footer.SocialLinks>
          <Footer.SocialLink platform="twitter" href="#" />
          <Footer.SocialLink platform="github" href="#" />
          <Footer.SocialLink platform="linkedin" href="#" />
        </Footer.SocialLinks>
      </Footer.Brand>

      <Footer.Column title="Product">
        <Footer.Link href="#">Features</Footer.Link>
        <Footer.Link href="#">Integrations</Footer.Link>
        <Footer.Link href="#">Pricing</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Resources">
        <Footer.Link href="#">Blog</Footer.Link>
        <Footer.Link href="#">Guides</Footer.Link>
        <Footer.Link href="#">Webinars</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Legal">
        <Footer.Link href="#">Privacy</Footer.Link>
        <Footer.Link href="#">Terms</Footer.Link>
        <Footer.Link href="#">Cookies</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 Brand. All rights reserved.</Footer.Copyright>
    </Footer>
  ),
};

export const Simple: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Simple" />

      <Footer.Column title="Links">
        <Footer.Link href="#">Home</Footer.Link>
        <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 Simple Inc.</Footer.Copyright>
    </Footer>
  ),
};

export const WithCustomLogo: Story = {
  render: () => (
    <Footer>
      <Footer.Brand
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            <span className="text-xl font-bold text-brand">MyApp</span>
          </div>
        }
        tagline="Your productivity companion"
      />

      <Footer.Column title="Product">
        <Footer.Link href="#">Features</Footer.Link>
        <Footer.Link href="#">Pricing</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Support">
        <Footer.Link href="#">Help</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 MyApp</Footer.Copyright>
    </Footer>
  ),
};

export const ManyColumns: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Enterprise" tagline="Enterprise solutions for modern businesses">
        <Footer.SocialLinks>
          <Footer.SocialLink platform="twitter" href="#" />
          <Footer.SocialLink platform="github" href="#" />
          <Footer.SocialLink platform="linkedin" href="#" />
          <Footer.SocialLink platform="youtube" href="#" />
        </Footer.SocialLinks>
      </Footer.Brand>

      <Footer.Column title="Products">
        <Footer.Link href="#">Analytics</Footer.Link>
        <Footer.Link href="#">Commerce</Footer.Link>
        <Footer.Link href="#">Insights</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Solutions">
        <Footer.Link href="#">Marketing</Footer.Link>
        <Footer.Link href="#">Sales</Footer.Link>
        <Footer.Link href="#">Support</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Developers">
        <Footer.Link href="#">API</Footer.Link>
        <Footer.Link href="#">SDKs</Footer.Link>
        <Footer.Link href="#">Webhooks</Footer.Link>
      </Footer.Column>

      <Footer.Column title="Company">
        <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Blog</Footer.Link>
        <Footer.Link href="#">Careers</Footer.Link>
        <Footer.Link href="#">Press</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 Enterprise Corp. All rights reserved.</Footer.Copyright>
    </Footer>
  ),
};

export const AllSocialPlatforms: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Social" tagline="Connect with us everywhere">
        <Footer.SocialLinks>
          <Footer.SocialLink platform="twitter" href="#" />
          <Footer.SocialLink platform="github" href="#" />
          <Footer.SocialLink platform="linkedin" href="#" />
          <Footer.SocialLink platform="youtube" href="#" />
          <Footer.SocialLink platform="facebook" href="#" />
          <Footer.SocialLink platform="instagram" href="#" />
        </Footer.SocialLinks>
      </Footer.Brand>

      <Footer.Column title="Product">
        <Footer.Link href="#">Features</Footer.Link>
        <Footer.Link href="#">Pricing</Footer.Link>
      </Footer.Column>

      <Footer.Copyright>© 2024 Social Inc.</Footer.Copyright>
    </Footer>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Platform" tagline="The all-in-one platform" />

      <Footer.Column title="Product">
        <Footer.Link href="#">Features</Footer.Link>
        <Footer.Link href="#">Pricing</Footer.Link>
      </Footer.Column>

      <Footer.Custom className="lg:col-span-2">
        <div className="rounded-lg border border-neutral-100 p-4">
          <h4 className="mb-2 text-sm font-bold text-gray-800">Newsletter</h4>
          <p className="mb-3 text-sm text-gray-600">Stay updated with our latest news</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border border-border-default px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90">
              Subscribe
            </button>
          </div>
        </div>
      </Footer.Custom>

      <Footer.Copyright>© 2024 Platform</Footer.Copyright>
    </Footer>
  ),
};

export const MinimalFooter: Story = {
  render: () => (
    <Footer>
      <Footer.Brand logoText="Minimal" />
      <Footer.Copyright>© 2024 Minimal</Footer.Copyright>
    </Footer>
  ),
};
