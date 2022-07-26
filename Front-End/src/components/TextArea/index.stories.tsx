import type { Meta } from '@storybook/react/types-6-0';
import { useForm } from 'react-hook-form';
import TextArea from '.';

export default {
  title: 'TextArea',
  component: TextArea,
} as Meta;

export const Default = (args) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: unknown) => null;
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <TextArea
        {...args}
        register={register}
        required={false}
        name="test"
        label="test"
      />
    </form>
  );
};
