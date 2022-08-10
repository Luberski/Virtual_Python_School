import { render, screen } from '@testing-library/react';
import StyledDialog from '.';
import Button from '@app/components/Button';

describe('StyledDialog', () => {
  it('should render without crashing when it is open', () => {
    render(
      <StyledDialog title="Title" isOpen={true} onClose={() => null}>
        <div>
          <div className="mt-2">
            <p className="text-sm text-red-500">Content</p>
          </div>
          <div className="mt-6 flex justify-between">
            <Button type="button">Close</Button>
          </div>
        </div>
      </StyledDialog>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('should not render when it is closed', () => {
    render(
      <StyledDialog title="Title" isOpen={false} onClose={() => null}>
        <Button type="button">Close</Button>
      </StyledDialog>
    );
    expect(screen.queryByText('Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });
});
