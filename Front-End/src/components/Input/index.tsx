import React from "react";

const Input = ({ label, register, required, ...rest }) => (
  <input
    {...register(label, { required })}
    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl w-96"
    {...rest}
  />
);
export default Input;
