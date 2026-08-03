import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EmptyState,
  IconButton,
  PageHeader,
  SectionCard,
  Spinner,
} from '@/components/ui/primitives';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(<PageHeader title="Settings" description="Manage preferences." />);
    expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Manage preferences.')).toBeInTheDocument();
  });

  it('renders actions next to the title', () => {
    render(<PageHeader title="Settings" actions={<button type="button">Reset</button>} />);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});

describe('SectionCard', () => {
  it('renders heading, description and content', () => {
    render(
      <SectionCard title="Capture" description="Defaults for new recordings.">
        <p>Body</p>
      </SectionCard>
    );
    expect(screen.getByRole('heading', { name: 'Capture', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Defaults for new recordings.')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders without a heading', () => {
    render(<SectionCard>Content only</SectionCard>);
    expect(screen.getByText('Content only')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });
});

describe('IconButton', () => {
  it('renders a labelled button and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton label="Delete" onClick={onClick}>
        X
      </IconButton>
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Spinner', () => {
  it('renders a spinning FA icon at the requested size', () => {
    const { container } = render(<Spinner size={24} />);
    const icon = container.querySelector('i.fa-circle-notch');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('fa-spin');
    expect(icon).toHaveStyle({ fontSize: '24px' });
  });
});

describe('EmptyState', () => {
  it('renders icon, title, description and action', () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="No results"
        description="Try again."
        action={<button type="button">Reload</button>}
      />
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });
});
