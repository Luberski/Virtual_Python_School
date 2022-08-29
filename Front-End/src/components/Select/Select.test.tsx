import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from '.';

const optList = [
  { id: 1, value: 'Opt1', disabled: false },
  { id: 2, value: 'Opt2', disabled: false },
];

const setup = () => {
  render(<Select options={optList}></Select>);
};

describe('Select', () => {
  it('checks option selected when user chooses first option', () => {
    setup();

    const openListbox = screen.getByRole('button', {
      name: /select option.../i,
    });

    fireEvent.click(openListbox);
    const listboxElem = screen.getByRole('listbox');
    const option1 = screen.getAllByRole('option')[0];

    userEvent.selectOptions(listboxElem, 'Opt1');
    fireEvent.click(option1);
    expect(listboxElem).toHaveTextContent('Opt1');
    expect(openListbox).toHaveTextContent('Opt1');
  });

  it('check option selected if user selected no option', () => {
    setup();

    const openListbox = screen.getByRole('button', {
      name: /select option.../i,
    });

    fireEvent.click(openListbox);
    fireEvent.click(openListbox);
    expect(openListbox).toHaveTextContent('Select option...');
  });
});
