import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Input from '../Input';
import Checkbox from '../Checkbox';
import FormDialog from '.';
import Button, { ButtonVariant } from '@app/components/Button';

export default {
  title: 'FormDialog',
  component: FormDialog,
} as ComponentMeta<typeof FormDialog>;

const Template: ComponentStory<typeof FormDialog> = (args) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit } = useForm();

  return (
    <div>
      <Button
        type="button"
        variant={ButtonVariant.PRIMARY}
        onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>
      <FormDialog
        {...args}
        title="Title"
        isOpen={isOpen}
        submitHandler={handleSubmit}
        onClose={() => setIsOpen(!isOpen)}>
        <div>
          <div className="flex flex-col justify-between">
            <p>Class name</p>
            <Input register={register} label="ClassroomName" />
            <br />
            <p>
              <Checkbox
                register={register}
                name="IsPublicCheckbox"
                label="public"></Checkbox>{' '}
              &nbsp;Public classroom
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export const WithIcon = Template.bind({});
