import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import Switch from '.';

export default {
  title: 'Switch',
  component: Switch,
} as ComponentMeta<typeof Switch>;

export const Default: ComponentStory<typeof Switch> = (args) => {
  const [checked, setChecked] = useState(false);
  return <Switch {...args} checked={checked} onChange={setChecked} />;
};

export const Checked: ComponentStory<typeof Switch> = (args) => {
  const [checked, setChecked] = useState(true);
  return <Switch {...args} checked={checked} onChange={setChecked} />;
};

export const Disabled: ComponentStory<typeof Switch> = (args) => {
  const [checked, setChecked] = useState(false);
  return (
    <Switch {...args} checked={checked} onChange={setChecked} disabled={true} />
  );
};

export const DisabledChecked: ComponentStory<typeof Switch> = (args) => {
  const [checked, setChecked] = useState(true);
  return (
    <Switch {...args} checked={checked} onChange={setChecked} disabled={true} />
  );
};
