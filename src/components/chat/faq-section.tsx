"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockFaqItems, FAQ_CATEGORIES } from "@/mock-data/faq";
import type { FaqCategory } from "@/mock-data/faq";

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-800">{question}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-4">{answer}</p>
      )}
    </div>
  );
}

export function FaqSection({
  dbFaqs,
}: {
  dbFaqs?: { id: string; category: string; title: string; content: string }[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const itemsSource = dbFaqs && dbFaqs.length > 0
    ? dbFaqs.map((f) => ({
        id: f.id,
        category: f.category,
        question: f.title,
        answer: f.content,
      }))
    : mockFaqItems;

  const categories = Array.from(new Set(itemsSource.map((item) => item.category))).sort();

  const filtered = itemsSource.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesQuery =
      !query ||
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const grouped = ["All", ...categories].reduce(
    (acc, cat) => {
      if (cat === "All") return acc;
      const items = filtered.filter((i) => i.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    },
    {} as Record<string, typeof filtered>
  );

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto px-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#f9e8e9] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-gray-400 text-gray-800"
        />
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-[#0A3864] text-white border-[#0A3864]"
                : "border-gray-300 text-gray-600 hover:border-[#0A3864]/40 hover:text-[#0A3864]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">No results found.</p>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-[#0A3864] uppercase tracking-wide mb-1">
              {category}
            </h3>
            <div className="bg-white rounded-2xl px-5 divide-y divide-gray-50">
              {items.map((item) => (
                <AccordionItem key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
