interface Props {
  message?: string;
  messages?: string[];
}

export default function FormError({ message, messages }: Props) {
  const errors = messages ?? (message ? [message] : []);

  if (errors.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/30" role="alert">
      <div className="flex items-start gap-3">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {errors.length === 1 ? "Error" : `${errors.length} errors found`}
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-red-700 dark:text-red-400">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}