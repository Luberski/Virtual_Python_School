import React from "react";

const Input = ({ label, register, required, ...rest }) => (
  <input
    {...register(label, { required })}
    className="p-3 bg-gray-100 border border-gray-300 rounded-xl w-96 dark:border-gray-600 dark:bg-gray-700"
    {...rest}
  />
);
export default Input;
