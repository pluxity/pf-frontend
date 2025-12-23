import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Listbox,
  ListboxContent,
  ListboxGroup,
  ListboxIcon,
  ListboxItem,
  ListboxItemDescription,
  ListboxItemText,
  ListboxLabel,
  ListboxSeparator,
  ListboxTrigger,
  ListboxValue,
} from "./Listbox";

const meta: Meta<typeof Listbox> = {
  title: "Molecules/Listbox",
  component: Listbox,
  parameters: {
    layout: "centered",
    docs: { canvas: { height: 320 } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const languages = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "ko", name: "Korean" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>("");

    return (
      <Listbox value={value} onValueChange={setValue}>
        <ListboxTrigger className="w-[220px]">
          <ListboxValue placeholder="Choose a language" />
          <ListboxIcon />
        </ListboxTrigger>
        <ListboxContent>
          {languages.map((lang) => (
            <ListboxItem key={lang.id} value={lang.id}>
              {lang.name}
            </ListboxItem>
          ))}
        </ListboxContent>
      </Listbox>
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = useState<string>("");

    const themes = [
      { id: "light", name: "Light", description: "Bright UI with clear contrast" },
      { id: "dark", name: "Dark", description: "Dimmed UI for low light" },
      { id: "system", name: "System", description: "Follow OS preference" },
    ];

    return (
      <Listbox value={value} onValueChange={setValue}>
        <ListboxTrigger className="w-[280px]">
          <ListboxValue placeholder="Pick a theme" />
          <ListboxIcon />
        </ListboxTrigger>
        <ListboxContent>
          <ListboxGroup>
            <ListboxLabel>Themes</ListboxLabel>
            {themes.map((theme) => (
              <ListboxItem key={theme.id} value={theme.id}>
                <div className="flex flex-col">
                  <ListboxItemText>{theme.name}</ListboxItemText>
                  <ListboxItemDescription>{theme.description}</ListboxItemDescription>
                </div>
              </ListboxItem>
            ))}
          </ListboxGroup>
        </ListboxContent>
      </Listbox>
    );
  },
};

export const WithSeparator: Story = {
  render: () => {
    const [value, setValue] = useState<string>("");

    return (
      <Listbox value={value} onValueChange={setValue}>
        <ListboxTrigger className="w-[220px]">
          <ListboxValue placeholder="Select option" />
          <ListboxIcon />
        </ListboxTrigger>
        <ListboxContent>
          <ListboxGroup>
            <ListboxLabel>Popular</ListboxLabel>
            <ListboxItem value="react">React</ListboxItem>
            <ListboxItem value="vue">Vue</ListboxItem>
          </ListboxGroup>
          <ListboxSeparator />
          <ListboxGroup>
            <ListboxLabel>Others</ListboxLabel>
            <ListboxItem value="angular">Angular</ListboxItem>
            <ListboxItem value="svelte">Svelte</ListboxItem>
          </ListboxGroup>
        </ListboxContent>
      </Listbox>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <Listbox value="" disabled>
        <ListboxTrigger className="w-[220px]">
          <ListboxValue placeholder="Disabled" />
          <ListboxIcon />
        </ListboxTrigger>
        <ListboxContent>
          <ListboxItem value="option1">Option 1</ListboxItem>
        </ListboxContent>
      </Listbox>
    );
  },
};

export const DisabledItem: Story = {
  render: () => {
    const [value, setValue] = useState<string>("");

    return (
      <Listbox value={value} onValueChange={setValue}>
        <ListboxTrigger className="w-[220px]">
          <ListboxValue placeholder="Select option" />
          <ListboxIcon />
        </ListboxTrigger>
        <ListboxContent>
          <ListboxItem value="option1">Available</ListboxItem>
          <ListboxItem value="option2" disabled>
            Disabled
          </ListboxItem>
          <ListboxItem value="option3">Available</ListboxItem>
        </ListboxContent>
      </Listbox>
    );
  },
};
