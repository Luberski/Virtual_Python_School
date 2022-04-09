import { ComponentMeta, ComponentStory } from '@storybook/react';
import NavBar from '.';

export default {
  title: 'NavBar',
  component: NavBar,
} as ComponentMeta<typeof NavBar>;

const Template: ComponentStory<typeof NavBar> = (args) => <NavBar {...args} />;

export const Default = Template.bind({});

export const NavBarLoggedIn = Template.bind({});

NavBarLoggedIn.args = {
  isLoggedIn: true,
  user: {
    name: 'Christopher',
    lastName: 'Adamson',
  },
};
