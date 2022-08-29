import { useState } from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import Select from '.';

const people = [
  'Wade Cooper Wade Coope Wade Cooper',
  'Arlene Mccoy',
  'Devon Webb',
  'Tom Cook',
  'Tanya Fox',
  'Hellen Schmidt',
];

describe('Select', () => {
  it('should render with a selected value', () => {
    const { result } = renderHook(() => useState(people[0]));
    const [selected, setSelected] = result.current;
    render(
      <Select options={people} selected={selected} setSelected={setSelected} />
    );
    expect(screen.getByText(people[0])).toBeInTheDocument();
  });
});
