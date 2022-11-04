import { useState } from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import Select from '.';

const people = [
  {
    id: 1,
    value: 'Wade Cooper Wade Coope Wade Cooper',
    label: 'Wade Cooper Wade Coope Wade Cooper',
    disabled: false,
  },
  {
    id: 2,
    value: 'Arlene Mccoy',
    label: 'Arlene Mccoy',
    disabled: false,
  },
  {
    id: 3,
    value: 'Tom Cook',
    label: 'Tom Cook',
    disabled: false,
  },
  {
    id: 4,
    value: 'Tanya Fox',
    label: 'Tanya Fox',
    disabled: false,
  },
  {
    id: 5,
    value: 'Hellen Schmidt',
    label: 'Hellen Schmidt',
    disabled: false,
  },
];

describe('Select', () => {
  it('should render with a selected value', () => {
    const { result } = renderHook(() => useState(people[0]));
    const [selected, setSelected] = result.current;
    render(
      <Select options={people} selected={selected} setSelected={setSelected} />
    );
    expect(screen.getByText(people[0].value)).toBeInTheDocument();
  });
});
