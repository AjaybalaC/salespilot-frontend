import clsx from "clsx";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <nav aria-label="Pagination" className={clsx("flex items-center justify-center gap-1", className)}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800">Prev</button>
      {pages.map((p, i) =>
        p === "..." ? <span key={`ellipsis-${i}`} className="px-2 text-slate-400">…</span> : (
          <button key={p} onClick={() => onPageChange(p)} aria-current={p === currentPage ? "page" : undefined} className={clsx("min-w-[2rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", p === currentPage ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800")}>{p}</button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800">Next</button>
    </nav>
  );
}