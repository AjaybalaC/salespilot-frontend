import { useId } from "react";
import clsx from "clsx";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function SearchBar({ label = "Search", className, id: externalId, ...props }: Props) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className={clsx("relative", className)}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        id={id}
        type="search"
        placeholder={label}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        {...props}
      />
    </div>
  );
}