import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { AcademicCapIcon } from '@heroicons/react/outline';
import StyledDialog from '.';
import Button from '@app/components/Button';

export default {
  title: 'StyledDialog',
  component: StyledDialog,
} as ComponentMeta<typeof StyledDialog>;

const Template: ComponentStory<typeof StyledDialog> = (args) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>
      <StyledDialog
        {...args}
        title="Title"
        isOpen={isOpen}
        icon={
          <div>
            <AcademicCapIcon className="h-5 w-5" />
          </div>
        }
        onClose={() => setIsOpen(!isOpen)}>
        <div>
          <div className="mt-2">
            <p className="text-sm text-red-500">Content</p>
          </div>
          <div className="mt-6 flex justify-between">
            <Button onClick={() => setIsOpen(!isOpen)} type="button">
              Close
            </Button>
          </div>
        </div>
      </StyledDialog>
    </div>
  );
};

export const WithIcon = Template.bind({});
