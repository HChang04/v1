
import React, { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  render?: (item: T) => ReactNode; // Custom render function for the cell content
  className?: string; // Class for <td>
  headerClassName?: string; // Class for <th>
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  trClassName?: string;
  thClassName?: string;
  tdClassName?: string;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

const Table = <T extends object,>({
  columns,
  data,
  keyExtractor,
  className = '',
  theadClassName = '',
  tbodyClassName = '',
  trClassName = '',
  thClassName = '',
  tdClassName = '',
  isLoading = false,
  emptyStateMessage = "No data available."
}: TableProps<T>): React.ReactNode => {
  
  const baseThStyle = "px-4 py-3 text-left text-xs font-medium text-[var(--color-base-content)] uppercase tracking-wider border-b border-[length:var(--border)] border-[var(--color-neutral)] bg-[var(--color-base-200)]";
  const baseTdStyle = "px-4 py-3 whitespace-nowrap text-sm text-[var(--color-base-content)] border-b border-[length:var(--border)] border-[var(--color-neutral)]";

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8 text-[var(--color-base-content)]">
            Loading data...
        </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
        <div className="text-center p-8 text-[var(--color-base-content)] bg-[var(--color-base-200)] rounded-[var(--radius-box)] border border-[length:var(--border)] border-[var(--color-neutral)]">
            {emptyStateMessage}
        </div>
    );
  }

  return (
    <div className={`overflow-x-auto shadow-[var(--depth)] rounded-[var(--radius-box)] border border-[length:var(--border)] border-[var(--color-neutral)] ${className}`}>
      <table className="min-w-full divide-y divide-[var(--color-neutral)] bg-[var(--color-base-100)]">
        <thead className={`bg-[var(--color-base-200)] ${theadClassName}`}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`${baseThStyle} ${column.headerClassName || ''} ${thClassName}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-[var(--color-neutral)] ${tbodyClassName}`}>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className={`hover:bg-[var(--color-base-200)] transition-colors duration-150 ${trClassName}`}>
              {columns.map((column, index) => (
                <td key={index} className={`${baseTdStyle} ${column.className || ''} ${tdClassName}`}>
                  {column.render 
                    ? column.render(item) 
                    : typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      : (item[column.accessor as keyof T] as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
