import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverviewCards } from './OverviewCards';

describe('OverviewCards', () => {
  it('shows formatted totals when data is available', () => {
    render(
      <OverviewCards
        data={{
          totalCount: 10_000,
          countriesRepresented: 12,
          jobTitlesRepresented: 20,
          topCountriesByHeadcount: [],
          topJobTitlesByHeadcount: [],
        }}
        isLoading={false}
      />,
    );

    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders placeholders without numbers while loading', () => {
    render(<OverviewCards data={undefined} isLoading={true} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('Total employees')).toBeInTheDocument();
  });
});
