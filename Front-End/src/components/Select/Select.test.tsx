import { useState } from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import Select from '.';

const people = [
  {
    id: 1,
    value: 'Wade Cooper Wade Coope Wade Cooper',
  },
  {
    id: 2,
    value: 'Arlene Mccoy',
  },
  {
    id: 3,
    value: 'Tom Cook',
  },
  {
    id: 4,
    value: 'Tanya Fox',
  },
  {
    id: 5,
    value: 'Hellen Schmidt',
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
