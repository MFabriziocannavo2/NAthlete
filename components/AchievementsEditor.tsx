"use client";

import { PlusIcon, TrashIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/Input";
import type { AchievementItem } from "@/lib/types";

export default function AchievementsEditor({
  items,
  onChange,
}: {
  items: AchievementItem[];
  onChange: (items: AchievementItem[]) => void;
}) {
  const updateItem = (index: number, patch: Partial<AchievementItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([...items, { title: "", description: "", date: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-orange-300">
              <TrophyIcon className="w-4 h-4" />
              Achievement {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-gray-400 hover:text-red-400 transition"
              aria-label="Remove achievement"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <Input
            placeholder="Title (e.g. MVP Tournament)"
            value={item.title}
            onChange={(e) => updateItem(i, { title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <Input
              placeholder="Description (e.g. Regional Cup 2024)"
              value={item.description ?? ""}
              onChange={(e) => updateItem(i, { description: e.target.value })}
            />
            <Input
              placeholder="Date / Year"
              value={item.date ?? ""}
              onChange={(e) => updateItem(i, { date: e.target.value })}
              className="sm:w-40"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-white/20 text-gray-300 hover:text-white hover:border-orange-400 transition text-sm font-medium"
      >
        <PlusIcon className="w-4 h-4" />
        Add Achievement
      </button>
    </div>
  );
}
