import { Sidebar } from "@/components/sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f5f5f3] overflow-hidden">
      {/* Floating collapsed sidebar */}
      <div className="m-3 mr-0 shrink-0">
        <div className="bg-[#e6edf5] rounded-2xl h-full w-[60px] flex flex-col">
          <Sidebar />
        </div>
      </div>

      {/* Content fills the rest */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
