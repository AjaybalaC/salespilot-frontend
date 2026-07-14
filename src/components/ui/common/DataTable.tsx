import clsx from "clsx";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({ columns, data, emptyMessage = "No data found", className }: Props<T>) {
  if (data.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className={clsx("overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700", className)}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={clsx("px-4 py-3 font-semibold text-slate-700 dark:text-slate-300", col.className)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              {columns.map((col) => (
                <td key={col.key} className={clsx("px-4 py-3 text-slate-600 dark:text-slate-400", col.className)}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}