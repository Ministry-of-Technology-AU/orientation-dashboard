"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
}

type ModalMode = "create" | "edit";

const CATEGORIES = ["Academics", "Housing", "Finance", "Campus Life"];

const EMPTY_FORM = { title: "", category: CATEGORIES[0], content: "" };

export function AdminFaqClient() {
  const [faqs, setFaqs] = useState<FaqDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: ModalMode; faq?: FaqDocument } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqDocument | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (Array.isArray(data)) setFaqs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, FaqDocument[]>>((acc, cat) => {
    const items = faqs.filter((f) => f.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  // Catch any categories not in CATEGORIES list
  faqs.forEach((f) => {
    if (!CATEGORIES.includes(f.category)) {
      grouped[f.category] = [...(grouped[f.category] ?? []), f];
    }
  });

  function openCreate() {
    setModal({ mode: "create" });
  }

  function openEdit(faq: FaqDocument) {
    setModal({ mode: "edit", faq });
  }

  function handleSaved(saved: FaqDocument) {
    setFaqs((prev) => {
      const existing = prev.findIndex((f) => f.id === saved.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModal(null);
  }

  async function handleDelete(faq: FaqDocument) {
    await fetch(`/api/admin/faqs/${faq.id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
    setDeleteTarget(null);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-primary-blue/2 min-w-0">
      {/* Header */}
      <div className="bg-white border-b border-primary-blue/8 px-8 py-5 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold text-primary-blue"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FAQ Management
            </h1>
            <p className="text-xs text-primary-blue/45 mt-0.5">
              {faqs.length} question{faqs.length !== 1 ? "s" : ""} across {Object.keys(grouped).length} categories
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-red text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-red/85 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New FAQ
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-primary-blue/30 animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-blue/5 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-blue/25" />
            </div>
            <p className="text-sm text-primary-blue/40">No FAQs yet. Create your first one.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-primary-blue/35">
                    {category}
                  </span>
                  <span className="text-[10px] text-primary-blue/25">· {items.length}</span>
                </div>
                <div className="bg-white rounded-2xl border border-primary-blue/8 overflow-hidden divide-y divide-primary-blue/5">
                  {items.map((faq) => (
                    <FaqRow
                      key={faq.id}
                      faq={faq}
                      onEdit={() => openEdit(faq)}
                      onDelete={() => setDeleteTarget(faq)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <FaqModal
          mode={modal.mode}
          faq={modal.faq}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirm
          faq={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}

function FaqRow({
  faq,
  onEdit,
  onDelete,
}: {
  faq: FaqDocument;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-start gap-3 text-left group"
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 text-primary-blue/30 shrink-0 mt-0.5 transition-transform",
              open && "rotate-180"
            )}
          />
          <span className="text-sm font-medium text-primary-blue/80 group-hover:text-primary-blue leading-snug transition-colors">
            {faq.title}
          </span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/30 hover:text-primary-blue hover:bg-blue-tint transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/30 hover:text-primary-red hover:bg-red-tint transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="px-5 pb-4 ml-10">
          <p className="text-sm text-primary-blue/55 leading-relaxed whitespace-pre-wrap">{faq.content}</p>
          <p className="text-[10px] text-primary-blue/25 mt-2">
            Updated {new Date(faq.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      )}
    </div>
  );
}

function FaqModal({
  mode,
  faq,
  onClose,
  onSaved,
}: {
  mode: ModalMode;
  faq?: FaqDocument;
  onClose: () => void;
  onSaved: (faq: FaqDocument) => void;
}) {
  const [form, setForm] = useState(
    faq ? { title: faq.title, category: faq.category, content: faq.content } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit" && !!faq;
  const canSave = form.title.trim() && form.category && form.content.trim() && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/faqs/${faq!.id}` : "/api/admin/faqs",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      onSaved(data as FaqDocument);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,56,100,0.15)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-blue/8 shrink-0">
          <h2 className="text-sm font-semibold text-primary-blue">
            {isEdit ? "Edit FAQ" : "New FAQ"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/30 hover:text-primary-blue hover:bg-blue-tint transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-primary-blue/50 uppercase tracking-[0.1em]">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-primary-blue/3 border border-primary-blue/10 rounded-xl px-4 py-2.5 text-sm text-primary-blue outline-none focus:border-primary-blue/25 focus:bg-white transition-all"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Question / Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-primary-blue/50 uppercase tracking-[0.1em]">
              Question
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="What is the grading system at Ashoka?"
              className="w-full bg-primary-blue/3 border border-primary-blue/10 rounded-xl px-4 py-2.5 text-sm text-primary-blue placeholder:text-primary-blue/25 outline-none focus:border-primary-blue/25 focus:bg-white transition-all"
            />
          </div>

          {/* Answer / Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-primary-blue/50 uppercase tracking-[0.1em]">
              Answer
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Write the answer here…"
              rows={7}
              className="w-full bg-primary-blue/3 border border-primary-blue/10 rounded-xl px-4 py-3 text-sm text-primary-blue placeholder:text-primary-blue/25 outline-none focus:border-primary-blue/25 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>

          {error && (
            <p className="text-xs text-primary-red bg-red-tint rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex gap-2.5 justify-end shrink-0 border-t border-primary-blue/6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-primary-blue/50 hover:text-primary-blue hover:bg-blue-tint rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2",
              canSave
                ? "bg-primary-red text-white hover:bg-primary-red/85 shadow-sm"
                : "bg-primary-blue/8 text-primary-blue/30 cursor-not-allowed"
            )}
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create FAQ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({
  faq,
  onCancel,
  onConfirm,
}: {
  faq: FaqDocument;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    await onConfirm();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,56,100,0.15)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-tint flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-primary-red" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-blue">Delete this FAQ?</p>
            <p className="text-sm text-primary-blue/50 mt-1 leading-relaxed">
              &ldquo;{faq.title.slice(0, 80)}{faq.title.length > 80 ? "…" : ""}&rdquo; will be permanently removed.
            </p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-primary-blue/50 hover:text-primary-blue hover:bg-blue-tint rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={deleting}
            className="px-5 py-2 text-sm font-medium rounded-xl bg-primary-red text-white hover:bg-primary-red/85 shadow-sm transition-colors flex items-center gap-2"
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
