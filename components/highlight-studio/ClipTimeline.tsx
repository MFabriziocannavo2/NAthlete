"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusIcon } from "@heroicons/react/24/outline";
import ClipItem from "./ClipItem";
import type { Clip } from "./types";

interface Props {
  clips: Clip[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAddMore: () => void;
}

export default function ClipTimeline({
  clips,
  selectedId,
  onSelect,
  onDelete,
  onSplit,
  onReorder,
  onAddMore,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Timeline
          <span className="ml-2 text-sm font-normal text-gray-400">
            {clips.length} clip{clips.length !== 1 ? "s" : ""}
          </span>
        </h2>
        <button
          type="button"
          onClick={onAddMore}
          className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Add clips
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={clips.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {clips.map((clip) => (
              <ClipItem
                key={clip.id}
                clip={clip}
                isSelected={clip.id === selectedId}
                onSelect={() => onSelect(clip.id)}
                onDelete={() => onDelete(clip.id)}
                onSplit={() => onSplit(clip.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Total duration bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs text-gray-400">
        <span>Total:</span>
        <span className="text-white font-mono">
          {clips.reduce((sum, c) => sum + (c.trimEnd - c.trimStart), 0).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
