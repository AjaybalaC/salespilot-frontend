import { useState } from "react";
import clsx from "clsx";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  onDelete: () => Promise<void> | void;
  itemName?: string;
  disabled?: boolean;
  className?: string;
}

export default function DeleteButton({ onDelete, itemName = "this item", disabled, className }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try { await onDelete(); } finally { setLoading(false); setOpen(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} disabled={disabled} className={clsx("inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30", className)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Delete
      </button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={handleConfirm} loading={loading} destructive title="Delete Item" description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`} confirmLabel="Delete" />
    </>
  );
}