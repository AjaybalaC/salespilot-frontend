"use client";

import { LineItemForm } from "@/types/quotation-invoice.types";
import { calculateItemTotal, formatCurrency, EMPTY_LINE_ITEM } from "@/constants/quotation-invoice.constants";

interface Props {
  items: LineItemForm[];
  onChange: (items: LineItemForm[]) => void;
}

export default function LineItemsEditor({ items, onChange }: Props) {
  const updateItem = (index: number, field: keyof LineItemForm, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const addItem = () => onChange([...items, { ...EMPTY_LINE_ITEM }]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const inputClass =
    "w-full px-2.5 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-1">
        {[
          { label: "Description", col: "col-span-4" },
          { label: "Qty", col: "col-span-1" },
          { label: "Unit Price", col: "col-span-2" },
          { label: "Discount %", col: "col-span-2" },
          { label: "Tax %", col: "col-span-1" },
          { label: "Total", col: "col-span-1" },
          { label: "", col: "col-span-1" },
        ].map((h) => (
          <p key={h.label} className={`text-slate-500 text-xs ${h.col}`}>
            {h.label}
          </p>
        ))}
      </div>

      {/* Items */}
      {items.map((item, index) => {
        const total = calculateItemTotal(item);
        return (
          <div key={index} className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-2 md:items-center">
            {/* Description */}
            <div className="md:col-span-4">
              <label className="md:hidden text-slate-500 text-xs mb-1 block">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Service or product name"
                className={inputClass}
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-2 md:contents">
              <div className="md:col-span-1">
                <label className="md:hidden text-slate-500 text-xs mb-1 block">Qty</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  min="1"
                  className={inputClass}
                />
              </div>

              {/* Unit Price */}
              <div className="md:col-span-2">
                <label className="md:hidden text-slate-500 text-xs mb-1 block">Unit Price (₹)</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  placeholder="0"
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Discount & Tax */}
            <div className="grid grid-cols-2 gap-2 md:contents">
              <div className="md:col-span-2">
                <label className="md:hidden text-slate-500 text-xs mb-1 block">Discount %</label>
                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) => updateItem(index, "discount", e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-1">
                <label className="md:hidden text-slate-500 text-xs mb-1 block">Tax %</label>
                <input
                  type="number"
                  value={item.tax}
                  onChange={(e) => updateItem(index, "tax", e.target.value)}
                  placeholder="18"
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Total */}
            <div className="md:col-span-1">
              <label className="md:hidden text-slate-500 text-xs mb-1 block">Total</label>
              <p className="text-emerald-400 text-sm font-semibold px-1">
                {total > 0 ? formatCurrency(total) : "—"}
              </p>
            </div>

            {/* Remove */}
            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}

      {/* Add item */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm hover:border-indigo-500/50 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
    </div>
  );
}