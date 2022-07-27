import { PlusCircleIcon } from '@heroicons/react/solid';
import { render, screen } from '@testing-library/react';
import IconButton, { IconButtonVariant } from '.';

describe('IconButton', () => {
  it('should render without crashing', () => {
    render(
      <IconButton type="button" icon={<PlusCircleIcon className="h-5 w-5" />}>
        Add
      </IconButton>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <IconButton type="button" icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should render with a className', () => {
    render(
      <IconButton
        type="button"
        className="test"
        icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello')).toHaveClass('test');
  });

  it('should render with a variant', () => {
    render(
      <IconButton
        type="button"
        variant={IconButtonVariant.OUTLINE}
        icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello')).toHaveClass('btn-outline');
  });

  it('should render with a disabled', () => {
    render(
      <IconButton
        type="button"
        disabled
        icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello')).toBeDisabled();
  });

  it('should render with a submit type', () => {
    render(
      <IconButton type="submit" icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello')).toHaveAttribute('type', 'submit');
  });

  it('should render with a default type', () => {
    render(
      <IconButton type="button" icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello')).toHaveAttribute('type', 'button');
  });
  it('should render with a icon', () => {
    render(
      <IconButton type="button" icon={<PlusCircleIcon className="h-5 w-5" />}>
        Hello
      </IconButton>
    );
    expect(screen.getByText('Hello').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Hello').querySelector('svg')).toHaveClass(
      'h-5 w-5'
    );
  });
});
