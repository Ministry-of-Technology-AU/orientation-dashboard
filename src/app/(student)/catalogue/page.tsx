"use client";

import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";

export default function CataloguePage() {
  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 font-sans">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-neutral-200/60 bg-white">
        <div className="flex items-center gap-4">
          <Link 
            href="/explore" 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            Full Catalogue <Library className="w-6 h-6 text-neutral-500" />
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-sm mx-auto">
        <div className="w-24 h-24 bg-white border border-neutral-200 rounded-3xl flex items-center justify-center mb-6 shadow-sm rotate-3">
          <Library className="w-10 h-10 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Catalogue Coming Soon</h2>
        <p className="text-neutral-500 leading-relaxed">
          The full directory of organizations is currently being assembled. Check back later to see every club available.
        </p>
      </main>
    </div>
  );
}
