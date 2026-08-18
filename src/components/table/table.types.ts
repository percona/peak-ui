import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
} from 'material-react-table';
import { type MutableRefObject } from 'react';
import { AlertProps } from '@mui/material/Alert';

export interface TableProps<T extends MRT_RowData> extends MRT_TableOptions<T> {
  tableInstanceRef?: MutableRefObject<MRT_TableInstance<T> | null>;
  noDataMessage?: string;
  emptyFilterResultsMessage?: string;
  hideExpandAllIcon?: boolean;
  tableName: string;
  emptyState?: React.ReactNode;
  noDataAlertProps?: AlertProps;
  enableRowHoverAction?: boolean;
  rowHoverAction?: (row: MRT_Row<T>) => void;
}
