"use client";

import { useState, useRef } from "react";
import {
  FileText, Map, Navigation2, PackageCheck,
  HeartPulse, Phone, CheckCircle2, Circle, ArrowRight,
} from "lucide-react";
import { TourStep } from "@/components/guided-tour";

const GUIDES = [
  {
    id: "documents",
    icon: FileText,
    label: "Documents",
    title: "Documents to Submit",
    description: "Complete your profile and upload all required documents on the dashboard before arriving on campus.",
    items: [
      "Complete Anti-ragging Affidavit on the UGC portal — enter the reference number in the Upload Originals section",
      "Download, fill, and upload the Authorization Form for Emergency Medical & General Health — carry a physical copy to the Registrar's desk on campus",
      "Fill and upload the Student and Parent Handbook Declaration Form",
      "Fill and upload the Residence Leave Approval and Consent Form — read the policy carefully before signing",
      "Upload Class XII mark sheet/transcript and passing certificate (DigiLocker accepted if originals are delayed)",
      "Upload Class X mark sheet/transcript and certificate",
      "Upload Aadhaar card (Indian nationals) or Passport (international students)",
      "Optional: Submit UGC Academic Bank of Credits (ABC) form and enter the 12-digit reference number",
      "Optional: Upload Domicile certificate (Haryana domicile students) or UG mark sheet (transfer students)",
      "Bring all original documents on arrival — the Registrar's Office will verify and return them immediately",
    ],
  },
  {
    id: "campus-tour",
    icon: Map,
    label: "Campus Map",
    title: "Campus Tour",
    description: "Key buildings and facilities you'll be using from day one. Use the virtual campus map to locate your residential block.",
    items: [
      "Use Google Chrome or Safari to view the interactive campus map — Firefox may not render it correctly",
      "Search by residential block name in the map search bar to find your room location",
      "Rooms are twin-sharing with central air-conditioning and window blinds for privacy",
      "Each floor has a pantry: microwave, fridge, induction plate, kettle, and water cooler",
      "Washing machines are available in all residence halls",
      "ACWB (Counselling Centre) — CN313, 3rd Floor, AC04, Library Building",
      "Student Care Office — RH2, Ground Floor",
      "Tuck Shop and Stationery Shop are on campus — good for buying toiletries and supplies after arrival",
    ],
  },
  {
    id: "reach-campus",
    icon: Navigation2,
    label: "Getting Here",
    title: "How to Reach Campus",
    description: "Directions, shuttle timings, and transport options from major hubs to Ashoka University.",
    items: [
      "Refer to the 'How to Reach Ashoka University' PDF and video guide available in the Quick Links section of the dashboard",
      "An updated shuttle schedule is available in the Quick Links section — refer to the shuttle booking guide for instructions",
      "From IGI Airport (T1/T2/T3): ~45 min via NH-44 towards Sonipat, Haryana",
      "From Hazrat Nizamuddin / New Delhi railway station: ~60 min by cab",
      "Nearest railway station: Sonipat Junction — 30 min by auto/cab to campus",
      "Nearest metro: Samaypur Badli (Red Line, Delhi) — take a cab from there",
      "Campus is located in Rajiv Gandhi Education City, Sonipat — GPS: 28.9452° N, 77.0964° E",
    ],
  },
  {
    id: "movein",
    icon: PackageCheck,
    label: "Move-in",
    title: "Move-in Checklist",
    description: "What's in your room and what to bring — so nothing gets left behind before your big move.",
    items: [
      "Room comes with: extra-long single bed (L80\" × W38\") with mattress, 2 bed drawers, overhead bed light",
      "Room comes with: wardrobe/cupboard with mirror, study table & chair, white board, soft board, and bookshelves",
      "Bring: bedding (pillow, sheets, light blanket) — mattress is provided but linen is not",
      "Bring: towels × 2 and personal hygiene essentials",
      "Bring: laptop, charger, and earphones",
      "Bring: rain jacket or umbrella — August is monsoon season during O-Week",
      "Bring: a warm layer — classrooms and the library are heavily air-conditioned",
      "Bring: any personal medications and a copy of your prescription",
      "Tip: buy toiletries and stationery from campus shops after arrival to save packing space",
      "Tip: pack clothes for one season at a time — ideal for students with families living close to campus",
    ],
  },
  {
    id: "health",
    icon: HeartPulse,
    label: "Health & Wellbeing",
    title: "Health & Wellbeing",
    description: "Counselling, mental health support, and student care resources available to all Ashokans.",
    items: [
      "ACWB (Ashoka Centre for Well-Being) offers free, confidential counselling — book via the ACWB Portal or email well.being@ashoka.edu.in",
      "ACWB Helpline: +91-7082000421 (Mon–Fri, 10 AM–6 PM) for appointments and queries",
      "Walk-in sessions for urgent emotional needs: CN313, 3rd Floor, AC04, Library Building",
      "24/7 Mental Health Helplines: 1800-258-8121 | 1800-258-8999 | 1800-202-6121 (toll-free)",
      "Online counselling also available via the '1 to 1 Help' mobile app",
      "Student Care Office: non-clinical case managers for academic, emotional, and wellness support — studentcare@ashoka.edu.in | +91-7082000403",
      "OLS (Office of Learning Support): accessibility, academic accommodations, and assistive technology — ols@ashoka.edu.in",
      "Download the Ashoka mobile app (requires a registered Indian mobile number) for easy access to all campus services",
    ],
  },
  {
    id: "contacts",
    icon: Phone,
    label: "Key Contacts",
    title: "Key Contacts",
    description: "Save these numbers and emails before you arrive on campus.",
    items: [
      "Student Affairs (general queries): studentaffairs@ashoka.edu.in",
      "Registrar's Office (documents & verification): registrar@ashoka.edu.in",
      "ACWB Counselling: well.being@ashoka.edu.in | +91-7082000421 (Mon–Fri, 10 AM–6 PM)",
      "24/7 Mental Health Helpline: 1800-258-8121 (toll-free)",
      "Student Care Office: studentcare@ashoka.edu.in | +91-7082000403",
      "OLS (Learning Support): ols@ashoka.edu.in",
      "OSA Instagram: follow for campus updates and announcements",
    ],
  },
];

function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("orientation-guides-completed");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem("orientation-guides-completed", JSON.stringify([...set]));
}

export default function HomePage() {
  const [selectedId, setSelectedId] = useState(GUIDES[0].id);
  const [visible, setVisible] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadCompleted);
  const prevId = useRef(selectedId);

  function select(id: string) {
    if (id === selectedId) return;
    setVisible(false);
    setTimeout(() => {
      setSelectedId(id);
      prevId.current = id;
      setVisible(true);
    }, 180);
  }

  function toggleComplete(id: string) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveCompleted(next);
      return next;
    });
  }

  function goNext() {
    const idx = GUIDES.findIndex(g => g.id === selectedId);
    if (idx < GUIDES.length - 1) select(GUIDES[idx + 1].id);
  }

  const guide = GUIDES.find(g => g.id === selectedId)!;
  const Icon = guide.icon;
  const isCompleted = completedIds.has(selectedId);
  const currentIdx = GUIDES.findIndex(g => g.id === selectedId);
  const isLast = currentIdx === GUIDES.length - 1;
  const completedCount = GUIDES.filter(g => completedIds.has(g.id)).length;

  return (
    <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">

      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-5 shrink-0">
        <p className="text-[10px] font-bold tracking-[0.2em] text-primary-blue/25 uppercase mb-2">
          Orientation Dashboard · Ashoka University
        </p>
        <h1
          className="text-4xl font-bold text-primary-blue leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Welcome to Ashoka.
        </h1>
      </div>

      {/* ── SLO Letter Card ── */}
      <div className="mx-8 mb-6 shrink-0">
        <div className="relative rounded-2xl border border-primary-blue/10 bg-blue-tint/40 overflow-hidden">

          <div className="absolute -left-6 -top-6 w-40 h-40 rounded-full bg-primary-blue/5 pointer-events-none" />

          <div className="relative flex gap-6 px-7 py-6 items-start">
            {/* Seal */}
            <div className="shrink-0 w-14 h-14 rounded-full border-2 border-primary-blue/20 bg-white/60 flex flex-col items-center justify-center gap-0.5">
              <span className="text-[8px] font-black tracking-widest text-primary-blue/50 uppercase">SLO</span>
              <div className="w-5 h-px bg-primary-blue/20" />
              <span className="text-[6px] font-semibold tracking-wider text-primary-blue/30 uppercase">Ashoka</span>
            </div>

            {/* Message */}
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.2em] text-primary-blue/30 uppercase mb-3">
                A message from the Student Life Office
              </p>
              <p
                className="text-primary-blue/80 text-[15px] leading-[1.75] italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                &ldquo;Congratulations and Welcome to Ashoka University! You are about to begin
                an incredible journey, and it all starts here. Get ready to connect, explore,
                and grow as you prepare for success in your undergraduate journey. At Ashoka,
                you will find a community that inspires you to flourish and truly thrive.
                Let the adventure begin!&rdquo;
              </p>
              <p className="text-primary-blue/35 text-xs mt-3">
                — Office of Student Affairs, Ashoka University &nbsp;·&nbsp; Batch of UG 2029
              </p>
            </div>
          </div>

          {/* Date strip */}
          <div className="border-t border-primary-blue/8 px-7 py-2.5 flex items-center gap-6">
            {[
              ["Online Orientation", "11 Aug 2025"],
              ["O-Week begins", "18 Aug 2025"],
              ["Move-in", "Before 18 Aug 2025"],
            ].map(([label, value]) => (
              <span key={label} className="text-[11px] text-primary-blue/30">
                {label}: <span className="text-primary-blue/55 font-medium">{value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Guide Reader ── */}
      <TourStep
        id="home-guides"
        title="Orientation Guides"
        content="Read through each guide carefully — they cover everything you need before and after arriving on campus. Mark each one complete as you go."
        order={8}
        position="top"
        className="mx-8 mb-8 flex flex-1 min-h-0"
      >
        <div className="flex w-full rounded-2xl border border-primary-blue/10 bg-white/50 backdrop-blur-sm overflow-hidden">

          {/* Left nav */}
          <nav className="w-48 shrink-0 border-r border-primary-blue/8 py-3 flex flex-col">
            <div className="px-4 pb-2 flex items-center justify-between">
              <p className="text-[9px] font-black tracking-[0.2em] text-primary-blue/25 uppercase">
                Guides
              </p>
              <span className="text-[9px] font-semibold text-primary-blue/30 tabular-nums">
                {completedCount}/{GUIDES.length}
              </span>
            </div>

            {GUIDES.map(({ id, icon: NavIcon, label }) => {
              const isActive = id === selectedId;
              const isDone = completedIds.has(id);
              return (
                <button
                  key={id}
                  onClick={() => select(id)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative",
                    isActive
                      ? "text-primary-blue"
                      : "text-primary-blue/40 hover:text-primary-blue/70 hover:bg-primary-blue/4",
                  ].join(" ")}
                >
                  {isActive && (
                    <span className="absolute left-0 inset-y-1.5 w-0.75 rounded-r-full bg-primary-red" />
                  )}
                  <NavIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? "text-primary-red" : ""}`} />
                  <span className={`text-[13px] font-medium flex-1 ${isActive ? "text-primary-blue" : ""}`}>
                    {label}
                  </span>
                  {isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  )}
                </button>
              );
            })}

            {/* Progress bar */}
            <div className="mt-auto px-4 pt-3 pb-2">
              <div className="w-full h-1 rounded-full bg-primary-blue/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(completedCount / GUIDES.length) * 100}%` }}
                />
              </div>
              {completedCount === GUIDES.length && (
                <p className="text-[9px] text-emerald-600 font-semibold mt-1.5 text-center">
                  All guides complete!
                </p>
              )}
            </div>
          </nav>

          {/* Content panel */}
          <div
            className="flex-1 flex flex-col overflow-hidden transition-opacity duration-180"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <div className="flex-1 px-8 py-7 overflow-y-auto">
              {/* Guide header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCompleted ? "bg-emerald-50" : "bg-primary-red/8"}`}>
                  {isCompleted
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <Icon className="w-5 h-5 text-primary-red" />
                  }
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold text-primary-blue leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {guide.title}
                  </h2>
                  <p className="text-sm text-primary-blue/40 mt-1">{guide.description}</p>
                </div>
              </div>

              <div className="w-full h-px bg-primary-blue/6 mb-6" />

              <ol className="space-y-0">
                {guide.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 py-3.5 border-b border-primary-blue/5 last:border-none"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-blue/6 text-primary-blue/50 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-[13.5px] text-primary-blue/75 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Footer: mark complete + next */}
            <div className="shrink-0 border-t border-primary-blue/8 px-8 py-4 flex items-center justify-between">
              <button
                onClick={() => toggleComplete(selectedId)}
                className={[
                  "flex items-center gap-2 text-[13px] font-medium transition-colors",
                  isCompleted
                    ? "text-emerald-600 hover:text-emerald-700"
                    : "text-primary-blue/40 hover:text-primary-blue/70",
                ].join(" ")}
              >
                {isCompleted
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Circle className="w-4 h-4" />
                }
                {isCompleted ? "Marked as complete" : "Mark as complete"}
              </button>

              {!isLast ? (
                <button
                  onClick={() => { toggleComplete(selectedId); goNext(); }}
                  className="flex items-center gap-2 text-[13px] font-medium text-primary-blue bg-primary-blue/6 hover:bg-primary-blue/10 rounded-lg px-4 py-2 transition-colors"
                >
                  Next guide
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                !isCompleted && (
                  <button
                    onClick={() => toggleComplete(selectedId)}
                    className="flex items-center gap-2 text-[13px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-4 py-2 transition-colors"
                  >
                    Complete all guides
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>

        </div>
      </TourStep>

    </main>
  );
}
