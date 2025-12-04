import type { Meta, StoryObj } from "@storybook/react";
import {
  Form,
  FormContainer,
  FormSection,
  FormField,
  FormActions,
  FormRow,
} from "./Form";
import { Input } from "../../atoms/Input";
import { Textarea } from "../../atoms/Textarea";
import { Checkbox } from "../../atoms/Checkbox";
import { Switch } from "../../atoms/Switch";
import { Button } from "../../atoms/Button";

const meta: Meta<typeof Form> = {
  title: "Organisms/Form",
  component: Form,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <FormContainer
      title="Create Account"
      description="Fill out the form below to create your account"
    >
      <Form>
        <FormField label="Full Name" required>
          <Input placeholder="John Doe" />
        </FormField>

        <FormField label="Email" required>
          <Input type="email" placeholder="john@example.com" />
        </FormField>

        <FormField label="Password" required hint="At least 8 characters">
          <Input type="password" placeholder="••••••••" />
        </FormField>

        <FormField>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-sm text-[#333340]">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
        </FormField>

        <FormActions>
          <Button variant="ghost">Cancel</Button>
          <Button type="submit">Create Account</Button>
        </FormActions>
      </Form>
    </FormContainer>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <FormContainer
      title="Profile Settings"
      description="Update your profile information"
    >
      <Form>
        <FormField label="Full Name" required horizontal>
          <Input placeholder="John Doe" />
        </FormField>

        <FormField label="Email" required horizontal>
          <Input type="email" placeholder="john@example.com" />
        </FormField>

        <FormField label="Bio" horizontal>
          <Textarea placeholder="Tell us about yourself..." />
        </FormField>

        <FormField label="Website" horizontal hint="Include https://">
          <Input placeholder="https://example.com" />
        </FormField>

        <FormField label="Notifications" horizontal>
          <div className="flex items-center gap-2 pt-2">
            <Switch />
            <span className="text-sm text-[#333340]">Receive email notifications</span>
          </div>
        </FormField>

        <FormActions>
          <Button variant="ghost">Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </FormActions>
      </Form>
    </FormContainer>
  ),
};

export const WithSections: Story = {
  render: () => (
    <FormContainer title="User Registration">
      <Form>
        <FormSection title="Personal Information" description="Basic details about you">
          <FormRow>
            <FormField label="First Name" required>
              <Input placeholder="John" />
            </FormField>
            <FormField label="Last Name" required>
              <Input placeholder="Doe" />
            </FormField>
          </FormRow>

          <FormField label="Email" required>
            <Input type="email" placeholder="john@example.com" />
          </FormField>
        </FormSection>

        <FormSection title="Account Security">
          <FormField label="Password" required hint="At least 8 characters">
            <Input type="password" placeholder="••••••••" />
          </FormField>

          <FormField label="Confirm Password" required>
            <Input type="password" placeholder="••••••••" />
          </FormField>
        </FormSection>

        <FormSection title="Preferences">
          <FormField>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="newsletter" />
                <label htmlFor="newsletter" className="text-sm">
                  Subscribe to newsletter
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="updates" />
                <label htmlFor="updates" className="text-sm">
                  Receive product updates
                </label>
              </div>
            </div>
          </FormField>
        </FormSection>

        <FormActions>
          <Button variant="ghost">Cancel</Button>
          <Button type="submit">Register</Button>
        </FormActions>
      </Form>
    </FormContainer>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <FormContainer title="Contact Form">
      <Form>
        <FormField label="Name" required error="Name is required">
          <Input placeholder="Your name" error />
        </FormField>

        <FormField label="Email" required error="Please enter a valid email">
          <Input type="email" placeholder="your@email.com" error />
        </FormField>

        <FormField label="Subject">
          <Input placeholder="What's this about?" />
        </FormField>

        <FormField label="Message" required>
          <Textarea placeholder="Your message..." />
        </FormField>

        <FormActions>
          <Button type="submit">Send Message</Button>
        </FormActions>
      </Form>
    </FormContainer>
  ),
};

export const MultiColumn: Story = {
  render: () => (
    <FormContainer title="Shipping Address">
      <Form>
        <FormRow columns={2}>
          <FormField label="First Name" required>
            <Input placeholder="John" />
          </FormField>
          <FormField label="Last Name" required>
            <Input placeholder="Doe" />
          </FormField>
        </FormRow>

        <FormField label="Street Address" required>
          <Input placeholder="123 Main Street" />
        </FormField>

        <FormField label="Apartment, suite, etc.">
          <Input placeholder="Apt 4B" />
        </FormField>

        <FormRow columns={3}>
          <FormField label="City" required>
            <Input placeholder="New York" />
          </FormField>
          <FormField label="State" required>
            <Input placeholder="NY" />
          </FormField>
          <FormField label="ZIP Code" required>
            <Input placeholder="10001" />
          </FormField>
        </FormRow>

        <FormField label="Phone" hint="For delivery updates">
          <Input type="tel" placeholder="+1 (555) 000-0000" />
        </FormField>

        <FormActions>
          <Button variant="ghost">Back</Button>
          <Button type="submit">Continue to Payment</Button>
        </FormActions>
      </Form>
    </FormContainer>
  ),
};
