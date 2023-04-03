import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import Alert from '.';

export default {
  title: 'Alert',
  component: Alert,
} as ComponentMeta<typeof Alert>;

export const Default: ComponentStory<typeof Alert> = (args) => (
  <Alert {...args}>
    <p className="w-fit">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
  </Alert>
);

export const WithCustomIcon: ComponentStory<typeof Alert> = (args) => (
  <Alert {...args}>
    <InformationCircleIcon className="mr-2 h-6 w-6" />
    <p className="w-fit">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
  </Alert>
);
