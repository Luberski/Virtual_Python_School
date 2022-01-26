import { ComponentMeta, ComponentStory } from "@storybook/react";
import * as React from "react";
import Button from ".";

export default {
  title: "Button",
  component: Button,
} as ComponentMeta<typeof Button>;

export const Default: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Button</Button>
);

export const Primary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} className="btn-primary">
    Button
  </Button>
);

export const Secondary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} className="btn-secondary">
    Button
  </Button>
);

export const Disabled: ComponentStory<typeof Button> = (args) => (
  <Button {...args} disabled>
    Button
  </Button>
);
