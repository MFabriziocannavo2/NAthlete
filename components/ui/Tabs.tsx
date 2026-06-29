"use client";

import { useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export default function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: TabItem[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex border-b border-white/10 overflow-x-auto -mx-6 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition -mb-px ${
              activeTab?.id === tab.id
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-2">{activeTab?.content}</div>
    </div>
  );
}
