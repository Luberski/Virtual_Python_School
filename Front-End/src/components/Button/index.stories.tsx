import type { ComponentMeta, ComponentStory } from '@storybook/react';
import Button, { ButtonVariant } from '.';

export default {
  title: 'Button',
  component: Button,
} as ComponentMeta<typeof Button>;

export const Default: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Button</Button>
);

export const Primary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.PRIMARY}>
    Button
  </Button>
);

export const Secondary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.SECONDARY}>
    Button
  </Button>
);

export const Outline: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.OUTLINE}>
    Button
  </Button>
);

export const OutlinePrimary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.OUTLINE_PRIMARY}>
    Button
  </Button>
);

export const Danger: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.DANGER}>
    Button
  </Button>
);

export const Success: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.SUCCESS}>
    Button
  </Button>
);

export const FlatSecondary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.FLAT_SECONDARY}>
    Button
  </Button>
);

export const FlatPrimary: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.FLAT_PRIMARY}>
    Button
  </Button>
);

export const FlatDanger: ComponentStory<typeof Button> = (args) => (
  <Button {...args} variant={ButtonVariant.FLAT_DANGER}>
    Button
  </Button>
);

export const Disabled: ComponentStory<typeof Button> = (args) => (
  <Button {...args} disabled>
    Button
  </Button>
);
