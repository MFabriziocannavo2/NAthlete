"use client";

import { useEffect, useState } from "react";
import {
  ClockIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import SectionCard from "@/components/ui/SectionCard";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  createTimelineEntry,
  deleteTimelineEntry,
  listTimelineEntries,
  updateTimelineEntry,
} from "@/lib/timeline";
import { TIMELINE_CATEGORIES, type TimelineEntry } from "@/lib/types";

const emptyEntry = {
  title: "",
  description: "",
  entry_date: "",
  category: TIMELINE_CATEGORIES[0] as string,
};

export default function CareerTimeline({
  athleteId,
  isOwner = false,
}: {
  athleteId: string;
  isOwner?: boolean;
}) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(emptyEntry);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listTimelineEntries(athleteId).then(({ data, error }) => {
      setEntries(data);
      setLoadError(error);
      setLoading(false);
    });
  }, [athleteId]);

  const resetForm = () => {
    setForm(emptyEntry);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (entry: TimelineEntry) => {
    setForm({
      title: entry.title,
      description: entry.description ?? "",
      entry_date: entry.entry_date ?? "",
      category: entry.category,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    if (editingId) {
      const ok = await updateTimelineEntry(editingId, form);
      if (ok) {
        setEntries((prev) =>
          prev.map((e) => (e.id === editingId ? { ...e, ...form } : e))
        );
      }
    } else {
      const created = await createTimelineEntry({ athlete_id: athleteId, ...form });
      if (created) {
        setEntries((prev) => [created, ...prev]);
      }
    }

    setSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteTimelineEntry(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  if (loading) return (
    <SectionCard title="Career Timeline" icon={<ClockIcon className="w-5 h-5 text-orange-400" />}>
      <div className="space-y-3">
        <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 bg-white/5 rounded-lg animate-pulse w-3/4" />
      </div>
    </SectionCard>
  );

  return (
    <SectionCard title="Career Timeline" icon={<ClockIcon className="w-5 h-5 text-orange-400" />}>
      {loadError && (
        <p className="text-red-400 text-sm mb-4">
          Couldn&apos;t load timeline entries. Please refresh the page to try again.
        </p>
      )}

      {!loadError && entries.length === 0 && !showForm && (
        <p className="text-gray-400 text-sm mb-4">No timeline entries added yet.</p>
      )}

      {entries.length > 0 && (
        <div className="flex flex-col gap-6 mb-6">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-8 pb-1 border-l-2 border-white/10 last:pb-0">
              <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {entry.entry_date && (
                      <span className="text-xs font-semibold text-orange-300">
                        {entry.entry_date}
                      </span>
                    )}
                    <span className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                      {entry.category}
                    </span>
                  </div>
                  <p className="font-semibold text-white">{entry.title}</p>
                  {entry.description && (
                    <p className="text-sm text-gray-400 mt-1">{entry.description}</p>
                  )}
                </div>

                {isOwner && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="text-gray-400 hover:text-orange-300 transition"
                      aria-label="Edit entry"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-400 hover:text-red-400 transition"
                      aria-label="Delete entry"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <>
          {showForm ? (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <Input
                placeholder="Title (e.g. Team Captain)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Year / Date (e.g. 2026)"
                  value={form.entry_date}
                  onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                />
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {TIMELINE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="px-4 py-2"
                  disabled={saving || !form.title.trim()}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Entry"}
                </Button>
                <Button type="button" variant="secondary" className="px-4 py-2" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed border-white/20 text-gray-300 hover:text-white hover:border-orange-400 transition text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Timeline Entry
            </button>
          )}
        </>
      )}
    </SectionCard>
  );
}
