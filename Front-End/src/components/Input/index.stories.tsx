import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { useForm } from "react-hook-form";
import Input from ".";

export default {
  title: "Input",
  component: Input,
} as Meta;

export const Default = (args) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => console.log(data);
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...args}
        register={register}
        required={false}
        name="test"
        label="test"
      />
    </form>
  );
};
