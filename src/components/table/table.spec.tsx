import { render, screen } from '@testing-library/react';
import { type MRT_ColumnDef } from 'material-react-table';
import { describe, expect, it } from 'vitest';
import { baseThemeOptions, ThemeContextProvider } from '../../design';
import Table from './table';

type Row = { name: string };

const columns: MRT_ColumnDef<Row>[] = [{ header: 'Name', accessorKey: 'name' }];

describe('Table header with an active column filter', () => {
  const renderFiltered = (showColumnFilters: boolean) =>
    render(
      <ThemeContextProvider themeOptions={baseThemeOptions}>
        <Table<Row>
          tableName="filtered-table-test"
          columns={columns}
          data={[{ name: 'alpha' }]}
          initialState={{ columnFilters: [{ id: 'name', value: 'al' }], showColumnFilters }}
        />
      </ThemeContextProvider>
    );
  const filterIndicator = () =>
    screen.getByRole('button', { name: /Filtering by Name/, hidden: true }).parentElement!;

  it('hides the indicator while the filter row shows the filter', () => {
    renderFiltered(true);

    expect(getComputedStyle(filterIndicator()).display).toBe('none');
  });

  it('keeps the indicator while the filter row is hidden', () => {
    renderFiltered(false);

    expect(getComputedStyle(filterIndicator()).display).toBe('flex');
  });
});
